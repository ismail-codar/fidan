fidan.createElement("input", {
    className: function (element) {
        fidan.compute(function () {
            element.className = classNames({
                input: true,
                disabled: props.disabled$.$val
            });
        }, props.disabled$);
    }
});