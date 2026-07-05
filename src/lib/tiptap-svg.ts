import { Node } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';

/**
 * SVG Node Extension for Tiptap
 * Allows rendering and pasting SVG content within the editor.
 * SVG can be pasted as raw HTML/XML, and it will be preserved.
 */
export const SvgNode = Node.create({
  name: 'svg',
  
  group: 'block',
  
  atom: true,
  
  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-src'),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'svg',
        preserveAttributes: true,
        getAttrs: () => true,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['svg', HTMLAttributes];
  },

  addPasteRules() {
    return [
      {
        find: /<svg[^>]*>[\s\S]*?<\/svg>/gi,
        handler: ({ state, range, match }) => {
          const { tr } = state;
          const content = match[0];
          
          // Insert the SVG as raw HTML by preserving it in the editor
          tr.insertText(content, range.from, range.to);
          return true;
        },
      },
    ];
  },
});

export default SvgNode;
