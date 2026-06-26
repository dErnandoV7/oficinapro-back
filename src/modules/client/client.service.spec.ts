import { Prisma } from "@prisma/client";
import { ClientService } from "../../modules/client/client.service";
import { ClientRepository } from "../../modules/client/client.repository";
import { AdminRepository } from "../../modules/admin/admin.repository";
import { BadRequest, NotFoundError } from "../../common/utils/error";

// 1. Mocks dos Repositórios
jest.mock("../../modules/client/client.repository", () => ({
  ClientRepository: {
    findWithStore: jest.fn(),
    getDebtSummary: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("../../modules/admin/admin.repository", () => ({
  AdminRepository: {
    findById: jest.fn(),
  },
}));

describe("ClientService", () => {
  const mockStoreId = "store-123";
  const mockClientId = "client-123";
  const mockAdminId = "admin-123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("delete()", () => {
    it("CT-17: Deve lançar erro ao tentar excluir um cliente com saldo devedor", async () => {
      // Cenário: Cliente existe, mas tem uma dívida de R$ 50
      (ClientRepository.findWithStore as jest.Mock).mockResolvedValue({ id: mockClientId });
      (ClientRepository.getDebtSummary as jest.Mock).mockResolvedValue({
        outstanding: new Prisma.Decimal(50), 
      });

      await expect(ClientService.delete(mockClientId, mockStoreId)).rejects.toThrow(BadRequest);
      await expect(ClientService.delete(mockClientId, mockStoreId)).rejects.toThrow(
        "Não é possível excluir um cliente com saldo devedor em aberto."
      );
      expect(ClientRepository.delete).not.toHaveBeenCalled();
    });

    it("CT-18: Deve excluir o cliente com sucesso se não houver saldo devedor", async () => {
      // Cenário: Cliente existe e a dívida é R$ 0
      (ClientRepository.findWithStore as jest.Mock).mockResolvedValue({ id: mockClientId });
      (ClientRepository.getDebtSummary as jest.Mock).mockResolvedValue({
        outstanding: new Prisma.Decimal(0), 
      });
      (ClientRepository.delete as jest.Mock).mockResolvedValue({ id: mockClientId });

      const result = await ClientService.delete(mockClientId, mockStoreId);

      expect(ClientRepository.delete).toHaveBeenCalledWith(mockClientId);
      expect(result).toHaveProperty("id", mockClientId);
    });
  });

  describe("create()", () => {
    it("CT-19: Deve lançar erro ao criar cliente se o admin não existir ou não tiver loja", async () => {
      // Cenário: Admin não encontrado no banco
      (AdminRepository.findById as jest.Mock).mockResolvedValue(null);

      const data = { name: "Novo Cliente", address: "Rua A" };

      await expect(ClientService.create(data, mockAdminId, mockStoreId)).rejects.toThrow(NotFoundError);
      await expect(ClientService.create(data, mockAdminId, mockStoreId)).rejects.toThrow(
        "Não foi possível criar o cliente. O usuário admin não existe ou não está vinculado à loja."
      );
    });
  });

  describe("profile()", () => {
    it("CT-20: Deve retornar o perfil do cliente junto com o resumo de dívidas", async () => {
      const mockClient = { id: mockClientId, name: "João" };
      const mockDebtSummary = { outstanding: new Prisma.Decimal(100), openSalesCount: 2 };

      (ClientRepository.findWithStore as jest.Mock).mockResolvedValue(mockClient);
      (ClientRepository.getDebtSummary as jest.Mock).mockResolvedValue(mockDebtSummary);

      const result = await ClientService.profile(mockClientId, mockStoreId);

      expect(ClientRepository.findWithStore).toHaveBeenCalledWith(mockClientId, mockStoreId);
      expect(ClientRepository.getDebtSummary).toHaveBeenCalledWith(mockClientId, mockStoreId);
      expect(result).toEqual({
        client: mockClient,
        debtSummary: mockDebtSummary,
      });
    });
  });
});