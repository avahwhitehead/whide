const defaultFileTemplate: string =
`program read IN {
	// Read the parts of the input
	X := hd IN;
	Y := hd tl IN;

	// Do something here
	// ...

	// And finally output the result
	OUT := IN
} write OUT
`;

export type FileTemplateList = {
	default: string;
};

const templates: FileTemplateList = {
	default: defaultFileTemplate,
}
export default templates;
