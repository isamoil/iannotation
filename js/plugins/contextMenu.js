$(document).keydown(function (event) {
    var pressedKey = String.fromCharCode(event.keyCode).toLowerCase();
    if (
        event.which === 123 ||
            (
                event.ctrlKey && event.shiftKey ||
                event.ctrlKey && event.metaKey ||
                event.ctrlKey ||
                event.metaKey
            ) &&
            (
                pressedKey === "i" ||
                pressedKey === "j" ||
                pressedKey === "s" ||
                pressedKey === "u"
            ) ||
        (
            event.ctrlKey && event.shiftKey ||
            event.ctrlKey && event.metaKey
        ) &&
        (
            pressedKey === "c"
        )

    ) {
            swal({
                title: "Upsss!",
                text: "Man, what do you want to do? Leave the code alone, everything is fine there!!!",
                icon: "warning",
                button: "I got it!",
            });
            return false;
    }
});

window.onload = function () {
    document.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        var t = document.getElementById("context-menu");
        t.style.top = `${e.clientY}px`, t.style.left = `${e.clientX}px`, t.classList.add("active")
    }), document.addEventListener("click", function (e) {
        document.getElementById("context-menu").classList.remove("active")
    })
};
var currentSelectedInput = null;

function reload() {
    window.location.reload()
}

function copy() {
    var e = "";
    if (window.getSelection) e = window.getSelection(); else if (document.getSelection) e = document.getSelection(); else {
        if (!document.selection) return;
        e = document.selection.createRange().text
    }
    const t = document.createElement("textarea");
    t.value = e, document.body.appendChild(t), t.select(), document.execCommand("copy"), document.body.removeChild(t)
}

function paste() {
    navigator.clipboard.readText().then(e => currentSelectedInput.value = currentSelectedInput.value + e)
}

window.addEventListener("load", function () {
    document.getElementsByTagName("body")[0].onmousedown = function (e) {
        3 === e.which && ("input" === e.srcElement.localName ? (document.getElementById("paste").hidden = !1, currentSelectedInput = e.srcElement) : document.getElementById("paste").hidden = !0)
    }
}, !1);