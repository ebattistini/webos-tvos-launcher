// Per-input card art and label overrides.
//
// By default every input card uses the TV's own input name (Settings → Inputs on the TV)
// and neutral bundled art. To use your own pictures, create src/config/inputArt.local.ts
// (git-ignored; see inputArt.local.example.ts), put images in public/icons/inputs/custom/,
// and rebuild. Keys: EIM id (HDMI_1…HDMI_4) or LIVE_TV.

export interface InputArtOverride {
	/** path relative to the app root, e.g. icons/inputs/custom/HDMI_1.jpg */
	image?: string;
	/** card name; omit to use the TV's own input label */
	label?: string;
}

export type InputArtMap = Record<string, InputArtOverride>;

const GENERIC = 'icons/inputs/generic/';

/** Neutral, trademark-free defaults. */
const DEFAULTS: InputArtMap = {
	LIVE_TV: {image: GENERIC + 'live-tv.png'},
	HDMI_1: {image: GENERIC + 'hdmi-1.png'},
	HDMI_2: {image: GENERIC + 'hdmi-2.png'},
	HDMI_3: {image: GENERIC + 'hdmi-3.png'},
	HDMI_4: {image: GENERIC + 'hdmi-4.png'}
};

const localModules = import.meta.glob<{INPUT_ART?: InputArtMap}>('./inputArt.local.ts', {eager: true});
const LOCAL: InputArtMap = (localModules['./inputArt.local.ts'] || {}).INPUT_ART || {};

const ALIASES: Record<string, string> = {
	'com.webos.app.hdmi1': 'HDMI_1', 'com.webos.app.hdmi2': 'HDMI_2',
	'com.webos.app.hdmi3': 'HDMI_3', 'com.webos.app.hdmi4': 'HDMI_4',
	'com.webos.app.livetv': 'LIVE_TV', hdmi1: 'HDMI_1', hdmi2: 'HDMI_2', hdmi3: 'HDMI_3', hdmi4: 'HDMI_4', livetv: 'LIVE_TV'
};

function canonical (id: string, appId?: string): string {
	const up = (id || '').toUpperCase();
	if (DEFAULTS[up] || LOCAL[up]) return up;
	return ALIASES[(id || '').toLowerCase()] || (appId ? ALIASES[appId.toLowerCase()] : '') || up;
}

/** Local override (merged over the generic default), or undefined. */
export function inputArtFor (id: string, appId?: string): InputArtOverride | undefined {
	const key = canonical(id, appId);
	const d = DEFAULTS[key], l = LOCAL[key];
	if (!d && !l) return undefined;
	return {...(d || {}), ...(l || {})};
}
