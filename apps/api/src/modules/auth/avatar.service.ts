import { createAvatar } from '@dicebear/core';
import * as adventurer from '@dicebear/adventurer';
import * as adventurerNeutral from '@dicebear/adventurer-neutral';
import * as avataaars from '@dicebear/avataaars';
import * as avataaarsNeutral from '@dicebear/avataaars-neutral';
import * as bigEars from '@dicebear/big-ears';
import * as bigEarsNeutral from '@dicebear/big-ears-neutral';
import * as bigSmile from '@dicebear/big-smile';
import * as bottts from '@dicebear/bottts';
import * as botttsNeutral from '@dicebear/bottts-neutral';
import * as croodles from '@dicebear/croodles';
import * as croodlesNeutral from '@dicebear/croodles-neutral';
import * as funEmoji from '@dicebear/fun-emoji';
import * as icons from '@dicebear/icons';
import * as identicon from '@dicebear/identicon';
import * as initials from '@dicebear/initials';
import * as lorelei from '@dicebear/lorelei';
import * as loreleiNeutral from '@dicebear/lorelei-neutral';
import * as micah from '@dicebear/micah';
import * as miniavs from '@dicebear/miniavs';
import * as openPeeps from '@dicebear/open-peeps';
import * as personas from '@dicebear/personas';
import * as pixelArt from '@dicebear/pixel-art';
import * as pixelArtNeutral from '@dicebear/pixel-art-neutral';
import * as shapes from '@dicebear/shapes';
import * as thumbs from '@dicebear/thumbs';
import { AvatarConfig } from '@stemlab/shared-types';

/**
 * Avatar Service - Manages avatar generation using DiceBear API
 *
 * DiceBear creates unique, deterministic avatars based on a seed value.
 * The same seed will always generate the same avatar, making it perfect
 * for consistent user profiles.
 */
export class AvatarService {
  /**
   * Map of avatar style names to their DiceBear collections
   */
  private static styleMap: Record<string, any> = {
    'adventurer': adventurer,
    'adventurer-neutral': adventurerNeutral,
    'avataaars': avataaars,
    'avataaars-neutral': avataaarsNeutral,
    'big-ears': bigEars,
    'big-ears-neutral': bigEarsNeutral,
    'big-smile': bigSmile,
    'bottts': bottts,
    'bottts-neutral': botttsNeutral,
    'croodles': croodles,
    'croodles-neutral': croodlesNeutral,
    'fun-emoji': funEmoji,
    'icons': icons,
    'identicon': identicon,
    'initials': initials,
    'lorelei': lorelei,
    'lorelei-neutral': loreleiNeutral,
    'micah': micah,
    'miniavs': miniavs,
    'open-peeps': openPeeps,
    'personas': personas,
    'pixel-art': pixelArt,
    'pixel-art-neutral': pixelArtNeutral,
    'shapes': shapes,
    'thumbs': thumbs,
  };

  /**
   * Default avatar style for students
   */
  private static readonly DEFAULT_STYLE = 'adventurer';

  /**
   * Generate avatar configuration from a seed
   *
   * @param seed - Unique string to generate avatar (e.g., username)
   * @param style - Avatar style (default: 'adventurer')
   * @param options - Additional avatar options
   * @returns Avatar configuration object
   */
  public static generateAvatarConfig(
    seed: string,
    style: string = this.DEFAULT_STYLE,
    options: Record<string, any> = {}
  ): AvatarConfig {
    if (!this.styleMap[style]) {
      throw new Error(`Invalid avatar style: ${style}`);
    }

    return {
      seed,
      style,
      backgroundColor: options.backgroundColor || this.getRandomColor(seed),
      ...options,
    };
  }

  /**
   * Generate avatar SVG from configuration
   *
   * @param config - Avatar configuration
   * @returns SVG string
   */
  public static generateAvatarSvg(config: AvatarConfig): string {
    const style = config.style || this.DEFAULT_STYLE;
    const collection = this.styleMap[style];

    if (!collection) {
      throw new Error(`Invalid avatar style: ${style}`);
    }

    const avatar = createAvatar(collection, {
      seed: config.seed,
      backgroundColor: config.backgroundColor ? [config.backgroundColor] : undefined,
      // Pass through any additional options
      ...config,
    });

    return avatar.toString();
  }

  /**
   * Generate avatar data URL (base64 encoded SVG)
   *
   * @param config - Avatar configuration
   * @returns Data URL string
   */
  public static generateAvatarDataUrl(config: AvatarConfig): string {
    const svg = this.generateAvatarSvg(config);
    const base64 = Buffer.from(svg).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  }

  /**
   * Generate a consistent color from a seed
   * Uses simple hash function to create consistent colors
   *
   * @param seed - Seed string
   * @returns Hex color code
   */
  private static getRandomColor(seed: string): string {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash; // Convert to 32bit integer
    }

    // Generate pastel colors (lighter, more kid-friendly)
    const r = Math.floor((Math.abs(hash) % 156) + 100); // 100-255
    const g = Math.floor((Math.abs(hash >> 8) % 156) + 100);
    const b = Math.floor((Math.abs(hash >> 16) % 156) + 100);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * Get list of available avatar styles
   *
   * @returns Array of style names
   */
  public static getAvailableStyles(): string[] {
    return Object.keys(this.styleMap);
  }

  /**
   * Validate avatar style
   *
   * @param style - Style name to validate
   * @returns True if style is valid
   */
  public static isValidStyle(style: string): boolean {
    return style in this.styleMap;
  }

  /**
   * Get student-friendly avatar styles
   * Returns a curated list of styles appropriate for elementary students
   *
   * @returns Array of kid-friendly style names
   */
  public static getStudentFriendlyStyles(): string[] {
    return [
      'adventurer',
      'adventurer-neutral',
      'big-ears',
      'big-ears-neutral',
      'big-smile',
      'bottts',
      'bottts-neutral',
      'croodles',
      'croodles-neutral',
      'fun-emoji',
      'lorelei',
      'lorelei-neutral',
      'micah',
      'miniavs',
      'open-peeps',
      'personas',
      'pixel-art',
      'pixel-art-neutral',
    ];
  }
}
