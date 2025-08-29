export function withPrevSignals(initialValue: string) {
	let curr: string | undefined = $state(initialValue);
	let prev: string | undefined = $state(undefined);

	function undo() {
		curr = prev;
		prev = undefined;
	}
	return {
		get curr() {
			return curr;
		},
		set curr(newValue) {
			prev = curr;
			curr = newValue;
		},
		get prev() {
			return prev;
		},
		undo
	};
}
