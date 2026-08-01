import { describe, it, expect } from 'vitest';
import { parseUrlHash } from '../../App';

describe('parseUrlHash', () => {
  it('returns empty fields for empty or invalid hash', () => {
    expect(parseUrlHash('')).toEqual({
      unitNo: '',
      councilName: '',
      unitLeader: '',
      unitLeaderPhone: ''
    });
    expect(parseUrlHash('#')).toEqual({
      unitNo: '',
      councilName: '',
      unitLeader: '',
      unitLeaderPhone: ''
    });
    expect(parseUrlHash('#noEqualsOrV2')).toEqual({
      unitNo: '',
      councilName: '',
      unitLeader: '',
      unitLeaderPhone: ''
    });
  });

  describe('Legacy V1 Logic', () => {
    it('parses full V1 key-value hash string', () => {
      const hash = '#unitNo=Troop+1&councilName=Dan+Beard+Council+(%23438)&unitLeader=Jim+smith&unitLeaderPhone=555-666-1234';
      const result = parseUrlHash(hash);
      expect(result).toEqual({
        unitNo: 'Troop 1',
        councilName: 'Dan Beard Council (#438)',
        unitLeader: 'Jim smith',
        unitLeaderPhone: '555-666-1234'
      });
    });

    it('defaults missing V1 keys to empty strings', () => {
      const hash = '#unitNo=Pack+42&unitLeader=Jane+Doe';
      const result = parseUrlHash(hash);
      expect(result).toEqual({
        unitNo: 'Pack 42',
        councilName: '',
        unitLeader: 'Jane Doe',
        unitLeaderPhone: ''
      });
    });
  });

  describe('Obfuscated V2 Logic', () => {
    it('decodes prompt example #v2.UDMyM340Mzh+SmltIHNtaXRofjU1NTY2NjEyMzQ correctly', () => {
      const hash = '#v2.UDMyM340Mzh+SmltIHNtaXRofjU1NTY2NjEyMzQ';
      const result = parseUrlHash(hash);
      expect(result).toEqual({
        unitNo: 'Pack 323',
        councilName: 'Dan Beard Council (#438)',
        unitLeader: 'Jim smith',
        unitLeaderPhone: '555-666-1234'
      });
    });

    it('expands unit prefixes T, P, C, O, S', () => {
      // T100~438~~ -> Troop 100
      const hashT = '#v2.' + btoa('T100~438~~').replace(/=/g, '');
      expect(parseUrlHash(hashT).unitNo).toBe('Troop 100');

      // P200~438~~ -> Pack 200
      const hashP = '#v2.' + btoa('P200~438~~').replace(/=/g, '');
      expect(parseUrlHash(hashP).unitNo).toBe('Pack 200');

      // C300~438~~ -> Crew 300
      const hashC = '#v2.' + btoa('C300~438~~').replace(/=/g, '');
      expect(parseUrlHash(hashC).unitNo).toBe('Crew 300');

      // O400~438~~ -> Post 400
      const hashO = '#v2.' + btoa('O400~438~~').replace(/=/g, '');
      expect(parseUrlHash(hashO).unitNo).toBe('Post 400');

      // S500~438~~ -> Ship 500
      const hashS = '#v2.' + btoa('S500~438~~').replace(/=/g, '');
      expect(parseUrlHash(hashS).unitNo).toBe('Ship 500');
    });

    it('preserves custom unit string if prefix does not match pattern', () => {
      const hashCustom = '#v2.' + btoa('Lodge 77~438~~').replace(/=/g, '');
      expect(parseUrlHash(hashCustom).unitNo).toBe('Lodge 77');
    });

    it('formats council name if found or falls back to Council #[number]', () => {
      // Council 438 exists in COUNCILS (Dan Beard Council)
      const hashKnown = '#v2.' + btoa('~438~~').replace(/=/g, '');
      expect(parseUrlHash(hashKnown).councilName).toBe('Dan Beard Council (#438)');

      // Council 99999 does not exist in COUNCILS
      const hashUnknown = '#v2.' + btoa('~99999~~').replace(/=/g, '');
      expect(parseUrlHash(hashUnknown).councilName).toBe('Council #99999');
    });

    it('formats 10-digit phone number into XXX-XXX-XXXX format', () => {
      const hash = '#v2.' + btoa('~~~5551234567').replace(/=/g, '');
      expect(parseUrlHash(hash).unitLeaderPhone).toBe('555-123-4567');
    });

    it('handles blank/missing fields gracefully', () => {
      const hash = '#v2.' + btoa('P323~438~~').replace(/=/g, '');
      expect(parseUrlHash(hash)).toEqual({
        unitNo: 'Pack 323',
        councilName: 'Dan Beard Council (#438)',
        unitLeader: '',
        unitLeaderPhone: ''
      });
    });

    it('handles invalid base64 gracefully', () => {
      const hash = '#v2.!!!InvalidBase64!!!';
      expect(parseUrlHash(hash)).toEqual({
        unitNo: '',
        councilName: '',
        unitLeader: '',
        unitLeaderPhone: ''
      });
    });
  });
});
