import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CustomValidators } from '../../../../shared/validators/custom-validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);

  showPassword = false;

  registerForm: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    sobrenome: ['', [Validators.required, Validators.minLength(2)]],
    cpf: ['', [Validators.required, CustomValidators.cpfValidator()]],
    email: ['', [Validators.required, CustomValidators.emailValidator()]],
    telefone: [
      '',
      [
        Validators.required,
        Validators.pattern(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/),
      ],
    ],
    sexo: ['', [Validators.required]],
    idade: ['', [Validators.required, Validators.min(12), Validators.max(120)]],
    senha: ['', [Validators.required, CustomValidators.passwordValidator()]],
    endereco: this.fb.group({
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
      logradouro: ['', [Validators.required]],
      numero: ['', [Validators.required]],
      complemento: [''],
      bairro: ['', [Validators.required]],
      cidade: ['', [Validators.required]],
      estado: [
        '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(2)],
      ],
    }),
  });

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // MÉTODOS ACESSÍVEIS PELO TEMPLATE HTML:

  /**
   * Verifica se um campo do formulário está inválido e já foi modificado/tocado pelo usuário.
   * Suporta campos raiz e campos de grupos aninhados (ex: endereco.cep).
   */
  isFieldInvalid(fieldName: string, groupName?: string): boolean {
    const control = groupName
      ? this.registerForm.get(`${groupName}.${fieldName}`)
      : this.registerForm.get(fieldName);

    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const rawValues = this.registerForm.value;

      const payload = {
        ...rawValues,
        cpf: rawValues.cpf.replace(/\D/g, ''),
        email: rawValues.email.trim().toLowerCase(),
        telefone: rawValues.telefone.replace(/\D/g, ''),
      };

      console.log('Dados do Cadastro Limpos e Válidos:', payload);
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
