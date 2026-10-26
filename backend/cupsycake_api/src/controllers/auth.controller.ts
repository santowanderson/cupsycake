import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';

// Cadastro de Cliente e Endereço
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { first_name, last_name, cpf, email, password, ...otherData } =
      req.body;

    if (!first_name || !last_name || !cpf || !email || !password) {
      res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
      return;
    }

    // Validação de unicidade via Model
    const existing = await UserModel.findByEmailOrCpf(email, cpf);
    if (existing.length > 0) {
      res
        .status(409)
        .json({ error: 'E-mail ou CPF já cadastrados no sistema.' });
      return;
    }

    // Executa a criação no banco via Model
    const customerId = await UserModel.create({
      first_name,
      last_name,
      cpf,
      email,
      password,
      ...otherData,
    });

    res
      .status(201)
      .json({ message: 'Usuário cadastrado com sucesso!', customerId });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ error: 'Erro interno ao processar o cadastro.' });
  }
};

// Login do usuário
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Informe o e-mail e a senha.' });
      return;
    }

    const customer = await UserModel.findByEmail(email);
    if (!customer) {
      // Retorna 200 OK com success: false para manter o console do navegador limpo de erros 401
      res.status(200).json({ success: false, error: 'Credenciais inválidas.' });
      return;
    }

    // Validação da senha com bcrypt
    const isPasswordValid = await bcrypt.compare(
      password,
      customer.password_hash,
    );
    if (!isPasswordValid) {
      // Retorna 200 OK com success: false para manter o console do navegador limpo de erros 401
      res.status(200).json({ success: false, error: 'Credenciais inválidas.' });
      return;
    }

    // Inicialização da sessão
    req.session.userId = customer.id;
    req.session.email = customer.email;

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso!',
      user: {
        id: customer.id,
        first_name: customer.first_name,
        email: customer.email,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno ao realizar login.' });
  }
};

// Logout / Desconexão da seção atual
export const logout = (req: Request, res: Response): void => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao destruir sessão:', err);
      res.status(500).json({ error: 'Erro ao fazer logout.' });
      return;
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logout realizado com sucesso!' });
  });
};

// Buscar perfil utilizando a View do banco de dados através do Model
export const getProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const customerId = req.session.userId;
    if (!customerId) {
      // Retorna 200 OK com null para evitar disparar erro 401 no console do navegador
      res.status(200).json(null);
      return;
    }

    const numericCustomerId = Number(customerId);
    if (isNaN(numericCustomerId)) {
      res.status(200).json(null);
      return;
    }

    const profile = await UserModel.getProfileViewById(numericCustomerId);
    if (!profile) {
      res.status(200).json(null);
      return;
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res
      .status(500)
      .json({ error: 'Erro interno ao buscar perfil do usuário.' });
  }
};
