(function (o) {
  const n = (o["oc"] = o["oc"] || {});
  n.dictionary = Object.assign(n.dictionary || {}, {
    "%0 of %1": "",
    Bold: "Gras",
    Cancel: "Anullar",
    Italic: "Italica",
    "Remove color": "",
    "Restore default": "",
    Save: "Enregistrar",
    "Show more items": "",
    Underline: "",
  });
  n.getPluralForm = function (o) {
    return o > 1;
  };
})(window.CKEDITOR_TRANSLATIONS || (window.CKEDITOR_TRANSLATIONS = {}));
