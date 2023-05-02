class Toast {
  id = 1;
  toasts = [];
  constructor() {}
  addToast(toast) {
    toast.id = this.id;
    this.id += 1;
    this.toasts.push(toast);
  }
  removeToast(targetId) {
    this.toasts.splice(
      this.toasts.indexOf(this.toasts.find((t) => t.id === targetId)),
      1
    );
  }
  getToasts() {
    return this.toasts;
  }
}

export default Toast;
