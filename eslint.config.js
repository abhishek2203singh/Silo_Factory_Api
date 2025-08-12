import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser, // Existing globals
        ...globals.node, // Add Node.js globals
      },
    },
  },
  pluginJs.configs.recommended,
];
