export function validateEmail(email: string) {
  const regEx = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  const test = regEx.test(email);
  if (test) return true;
  return false;
}

export function validatePhone(phone: string) {
  const regEx = new RegExp(/\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/);
  const test = regEx.test(phone);
  if (test) return true;
  return false;
}