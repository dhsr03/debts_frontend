import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordStrengthValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const value: string = control.value || '';

  const errors: ValidationErrors = {};

  if (value.length < 8) {
    errors['minLength'] = true;
  }

  if (!/[A-Z]/.test(value)) {
    errors['hasUppercase'] = true;
  }

  if (!/[a-z]/.test(value)) {
    errors['hasLowercase'] = true;
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
    errors['hasSpecial'] = true;
  }

  return Object.keys(errors).length ? errors : null;
}
