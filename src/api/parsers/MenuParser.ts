export type Menu = {
	name: string,
	children: (Menu|MenuItem)[],
}

export type MenuItem = {
	name: string,
	command: string,
};

function _validate(menu : Menu[]) : boolean {
	//TODO: Validate menu format
	return true;
}

export default function parse(content: string) : Menu[] {
	let json : Menu[];
	try {
		//Check for valid JSON and matches the `Menu[]` type definition
		json = JSON.parse(content);
	} catch (e) {
		throw new Error("JSON in invalid format");
	}

	//TODO: Validate the object against internal rules
	if (!_validate(json)) throw new Error("Invalid data");

	//Return the object
	return json;
}