import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
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
  private router = inject(Router);
  private authService = inject(AuthService);

  // Estados reativos com Signals para controle de UI
  protected isLoading = signal<boolean>(false);
  protected errorMessage = signal<string | null>(null);

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

  /**
   * Verifica se um campo do formulário está inválido e já foi modificado/tocado pelo usuário.
   */
  isFieldInvalid(fieldName: string, groupName?: string): boolean {
    const control = groupName
      ? this.registerForm.get(`${groupName}.${fieldName}`)
      : this.registerForm.get(fieldName);

    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    // Reseta erros anteriores e ativa o estado de carregamento
    this.errorMessage.set(null);
    this.isLoading.set(true);

    const rawValues = this.registerForm.value;

    // Sanitização de dados e mapeamento para o padrão esperado pelo AuthService (RegisterRequest)
    const registerPayload = {
      name: `${rawValues.nome.trim()} ${rawValues.sobrenome.trim()}`,
      email: rawValues.email.trim().toLowerCase(),
      password: rawValues.senha, // Mapeado de 'senha' para 'password'
      cpf: rawValues.cpf.replace(/\D/g, ''),
      telefone: rawValues.telefone.replace(/\D/g, ''),
      sexo: rawValues.sexo,
      idade: rawValues.idade,
      endereco: rawValues.endereco,
    };

    // Comunicação com o backend através do AuthService
    this.authService.register(registerPayload).subscribe({
      next: () => {
        // O AuthService já gerencia a sessão salvando o token automaticamente.
        // Redirecionamos o usuário para a página inicial da aplicação logado.
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Falha ao registrar usuário:', err);

        // Tratamento amigável de erros retornados pela API
        if (err.status === 400 || err.status === 409) {
          this.errorMessage.set(
            'Este e-mail já está cadastrado ou os dados informados são inválidos.',
          );
        } else {
          this.errorMessage.set(
            'Não foi possível conectar ao servidor. Tente novamente mais tarde.',
          );
        }
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }
}
