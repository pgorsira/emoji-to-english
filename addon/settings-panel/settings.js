async function init() {
	await settingsInterface.getSettingsFromManager().catch(
		failure => { console.trace(failure); }
	);
	await emojiReplacer.init();
	await emojiStyler.init();
	restoreSettings();
}

function saveSetting(e) {
	const setting = e.target.name;
	let value = e.target.value;

	// cast input value to boolean
	if (e.target.hasAttribute('data-is-boolean')) {
		value = (value === 'true');
	}

	// transform checkbox data into list
	if (e.target.getAttribute('type') === 'checkbox') {
		const commonAncestorNode = e.target.closest('.options');
		const selectedNodes = commonAncestorNode.querySelectorAll('input[type="checkbox"]:checked');
		const checkedList = [];
		for (const checkboxNode of selectedNodes) {
			checkedList.push(checkboxNode.value);
		}
		value = checkedList;
	}

	settingsInterface.set(setting, value).catch(
		failure => { console.trace(failure); }
	);
	updatePreview();

	document.getElementById('settings').classList.add('changed', 'fresh');
	document.getElementById('changedMessage').addEventListener('transitionend', hideMessage);

	function hideMessage() {
		document.getElementById('settings').classList.remove('fresh');
		document.getElementById('changedMessage').removeEventListener('transitionend', hideMessage);
	}
}

function restoreSettings() {
	const formElements = document.forms[0].elements;

	settingsInterface.getSettingsFromManager().then(items => {
		for (let key in items) {
			if (formElements[key]) {
				// handle checkboxes
				if (formElements[key] instanceof RadioNodeList && Array.isArray(items[key])) {
					const checkedItems = items[key];
					for (const checkboxNode of formElements[key]) {
						if (checkedItems.includes(checkboxNode.value)) {
							checkboxNode.checked = true;
						}
					}
				} else {
					formElements[key].value = items[key];
				}
			}
		}
		updatePreview();
	}, failure => { console.trace(failure); });
}

function updatePreview() {
	const translatedNode = document.querySelector('#translated samp');
	translatedNode.textContent = document.querySelector('#original samp').textContent;

	emojiReplacer.translateTextNode(translatedNode.childNodes[0]);
}

document.addEventListener("DOMContentLoaded", init);

document.querySelector('form').addEventListener('change', e => saveSetting(e));