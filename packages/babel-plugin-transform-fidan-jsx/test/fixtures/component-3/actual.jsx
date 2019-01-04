let focused$ = false;
const InputElement1 = <Input focused$={focused$} {...InputProps} />;
const InputElement2 = <Input_ value={value$} />;
const InputElement3 = <Input value$={value$ + 1} />;
const InputElement4 = <Input_ value={value$ + 1} />;
