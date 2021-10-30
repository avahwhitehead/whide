import CodeMirror from "codemirror";
import 'codemirror/addon/mode/simple';

//Style mode name
export const WHILE = "WHILE";
export const PURE_WHILE = "WHILE-PURE";

/*
 * Syntax highlighting mode definition for the extended WHILE language.
 * Adapted from https://github.com/davidpomerenke/while-syntax-vscode
 */
CodeMirror.defineSimpleMode(WHILE, {
	start: [
		//Keywords
		{
			token: "keyword.operator.expression",
			regex: /\b(cons|hd|tl)\b/,
		},
		{
			token: "keyword.control.conditional",
			regex: /\b(if|else)\b/,
		},
		{
			token: "keyword.control.loop",
			regex: /\bwhile\b/,
		},
		{
			token: "keyword.control",
			regex: /\b(read|write)\b/,
		},
		{
			token: "keyword.control.switch",
			regex: /\b(switch|case|default)\b/,
		},

		//Atoms
		{
			token: "number",
			regex: /\b(-)?[0-9.]+\b/,
		},
		{
			token: "atom",
			regex: /\b(true|false)\b/,
		},
		{
			token: "constant.language.null",
			regex: /\bnil\b/,
		},

		//References
		{
			token: "keyword.constant.language",
			regex: /@(:=|\w*)/,
		},
		{
			token: "entity.name.function",
			regex: /<\w*>/,
		},
		{
			token: "entity.name.section",
			regex: /\w+(?=\s+read)/,
		},

		//Operators/Punctuation
		{
			token: "keyword.operator.assignment",
			regex: /:=/,
		},
		{
			token: "keyword.operator.logical",
			regex: /=/,
		},
		{
			token: "keyword.operator.definition",
			regex: /[<>]/,
		},
		{
			token: "punctuation.terminator",
			regex: /;/,
		},
		{
			token: "punctuation.separator",
			regex: /[,.]/,
		},

		//Comments
		{
			token: "comment.double-slash",
			regex: /\/\/[^\n]*/,
		},
		{
			regex: /\(\*/,
			token: "comment",
			next: "comment"
		},
	],

	// Multi-line comment
	comment: [
		{
			regex: /.*?\*\)/,
			token: "comment",
			next: "start"
		},
		{
			regex: /.*/,
			token: "comment"
		}
	],
});

/*
 * Syntax highlighting mode definition for the pure WHILE language.
 * Adapted from https://github.com/davidpomerenke/while-syntax-vscode
 */
CodeMirror.defineSimpleMode(PURE_WHILE, {
	start: [
		//Keywords
		{
			token: "keyword.operator.expression",
			regex: /\b(cons|hd|tl)\b/,
		},
		{
			token: "keyword.control.conditional",
			regex: /\b(if|else)\b/,
		},
		{
			token: "keyword.control.loop",
			regex: /\bwhile\b/,
		},
		{
			token: "keyword.control",
			regex: /\b(read|write)\b/,
		},

		//Atoms
		{
			token: "constant.language.null",
			regex: /\bnil\b/,
		},

		//References
		{
			token: "keyword.constant.language",
			regex: /@(:=|\w*)/,
		},
		{
			token: "entity.name.section",
			regex: /\w+(?=\s+read)/,
		},

		//Operators/Punctuation
		{
			token: "keyword.operator.assignment",
			regex: /:=/,
		},
		{
			token: "punctuation.terminator",
			regex: /;/,
		},
		{
			token: "punctuation.separator",
			regex: /\./,
		},

		//Comments
		{
			token: "comment.double-slash",
			regex: /\/\/[^\n]*/,
		},
		{
			regex: /\(\*/,
			token: "comment",
			next: "comment"
		},
	],

	// Multi-line comment
	comment: [
		{
			regex: /.*?\*\)/,
			token: "comment",
			next: "start"
		},
		{
			regex: /.*/,
			token: "comment"
		}
	],
});


//Export the style name for easier external referencing
export default WHILE;