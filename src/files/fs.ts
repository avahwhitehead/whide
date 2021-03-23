import nodeFs from "fs";
import { Volume } from 'memfs';
import { Union } from "unionfs/lib/union";
import { IFS } from "unionfs/lib/fs";

// @ts-ignore
function _loadVirtualFs() : Volume {
	//The virtual filesystem
	return Volume.fromJSON({
		'/p.while': 'p\nread X { }\nwrite X'
	});
}

//Manage the filesystems
export const ufs : Union = new Union();

//Use the physical filesystem only if available
if (nodeFs && Object.keys(nodeFs).length) ufs.use(nodeFs);
//Otherwise maintain a virtual filesystem in memory
else ufs.use(_loadVirtualFs());

//@ts-ignore
export const fs : IFS = ufs;
