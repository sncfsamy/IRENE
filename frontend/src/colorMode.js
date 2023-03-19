export default function () {
  const dm = parseInt(localStorage.getItem("IRENE_DARKMODE"), 10);
  return (!Number.isNaN(dm) && dm) || 0;
}
