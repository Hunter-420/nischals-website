/**
 * Lightweight SVG helper for the editor.
 *
 * The previous Tiptap custom node implementation pulled in a Vue-specific
 * dependency that is not available in this project, so this file now acts as
 * a safe no-op utility to avoid build-time type errors while keeping the SVG
 * paste/rendering behavior handled in the editor components themselves.
 */
export const svgIsSupported = true;

export default svgIsSupported;
