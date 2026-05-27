import { describe, it, expect } from 'vitest';
import { wrapText } from '../pdfGenerator';

describe('wrapText utility', () => {
  it('should return an empty array for empty inputs', () => {
    expect(wrapText('')).toEqual([]);
    expect(wrapText((null as any) as string)).toEqual([]);
  });

  it('should not wrap text shorter than max line length', () => {
    const text = 'Hello, this is a short sentence.';
    expect(wrapText(text, 70)).toEqual([text]);
  });

  it('should wrap text at word boundaries when exceeding limit', () => {
    const text = 'This is a longer sentence that will definitely exceed the standard maximum line length of forty characters.';
    // Wrap at 40 characters
    const wrapped = wrapText(text, 40);
    expect(wrapped.length).toBeGreaterThan(1);
    wrapped.forEach(line => {
      expect(line.length).toBeLessThanOrEqual(40);
    });
    // Reconstructing with spaces should equal the original string
    expect(wrapped.join(' ')).toEqual(text);
  });

  it('should preserve explicit paragraph newlines', () => {
    const text = 'First paragraph.\nSecond paragraph.';
    const wrapped = wrapText(text, 70);
    expect(wrapped).toEqual(['First paragraph.', 'Second paragraph.']);
  });

  it('should split extremely long words that exceed max limit', () => {
    const longWord = 'A' + 'B'.repeat(50) + 'C'; // 52 characters
    const wrapped = wrapText(longWord, 20);
    expect(wrapped).toEqual([
      'ABBBBBBBBBBBBBBBBBBB',
      'BBBBBBBBBBBBBBBBBBBB',
      'BBBBBBBBBBBC'
    ]);
  });
});
