import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CustomValidators } from '../../../../shared/validators/custom-validators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  showPassword = false;

  // Formulário de Login com as validações customizadas
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, CustomValidators.emailValidator()]],
    senha: ['', [Validators.required, CustomValidators.passwordValidator()]],
  });

  // Alterna a visibilidade da senha
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Método auxiliar para checar se o campo está inválido e tocado
  isFieldInvalid(fieldName: string): boolean {
    const control = this.loginForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, senha } = this.loginForm.value;

      // Boa Prática de Segurança: Sanitização dos dados antes de enviar à API
      const credentials = {
        email: email.trim().toLowerCase(), // Garante e-mail sem espaços e em minúsculo
        senha,
      };

      console.log('Credenciais Prontas para Envio:', credentials);

      // Exemplo de integração futura com serviço de autenticação:
      // this.authService.login(credentials).subscribe({
      //   next: () => this.router.navigate(['/']),
      //   error: (err) => console.error('Erro na autenticação', err)
      // });
    } else {
      // Marca todos os campos como tocados para exibir erros no HTML
      this.loginForm.markAllAsTouched();
    }
  }
}
