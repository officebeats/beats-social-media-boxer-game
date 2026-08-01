/**
 * Crash Out: Ring Rush — Share / Fight Card Export
 *
 * Uses Phaser's renderer.snapshot() to generate a shareable
 * 1080×1920 fight card image, then triggers the Web Share API
 * or downloads the image as a fallback.
 */

/**
 * Captures the current game frame as a PNG data URL.
 * @param game The Phaser.Game instance.
 * @returns Promise resolving to a data URL string.
 */
export function captureSnapshot(game: Phaser.Game): Promise<string> {
    return new Promise((resolve) => {
        game.renderer.snapshot((image: Phaser.Display.Color | HTMLImageElement) => {
            if (image instanceof HTMLImageElement) {
                resolve(image.src);
            }
        });
    });
}

/**
 * Generates a fight card image and triggers sharing.
 * Uses Web Share API on supported browsers, falls back to download.
 *
 * @param dataUrl The PNG data URL of the fight card.
 * @param fighterName The winner's name for the share text.
 */
export async function shareFightCard(dataUrl: string, fighterName: string): Promise<void> {
    const shareText = `🥊 ${fighterName} wins in CRASH OUT: RING RUSH! Can you beat my record? #CrashOutRingRush`;

    // Convert data URL to Blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], 'crash-out-fight-card.png', { type: 'image/png' });

    // Try Web Share API first (mobile native share sheet)
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
            await navigator.share({
                title: 'Crash Out: Ring Rush',
                text: shareText,
                files: [file],
            });
            return;
        } catch {
            // User cancelled or share failed — fall through to download
        }
    }

    // Fallback: download the image
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'crash-out-fight-card.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
