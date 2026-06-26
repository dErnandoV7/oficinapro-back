import { Prisma } from "@prisma/client";
import { PaymentService } from "../../modules/payment/payment.service";
import { PaymentRepository } from "../../modules/payment/payment.repository";
import { BadRequest, NotFoundError } from "../../common/utils/error";

// 1. Criando o "dublê" do Repositório (Mock)
jest.mock("../../modules/payment/payment.repository", () => ({
  PaymentRepository: {
    findSaleWithStore: jest.fn(),
    create: jest.fn(),
    list: jest.fn(),
  },
}));

describe("PaymentService", () => {
  const mockStoreId = "store-123";
  const mockSaleId = "sale-123";

  // Limpa o histórico do dublê antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create()", () => {
    it("CT-01: Deve criar um pagamento com sucesso (Pagamento Parcial ou Total)", async () => {
      // Cenário: Comanda tem R$ 100 de total, já pagou R$ 40. Saldo restante: R$ 60.
      (PaymentRepository.findSaleWithStore as jest.Mock).mockResolvedValue({
        id: mockSaleId,
        totalAmount: new Prisma.Decimal(100),
        amountPaid: new Prisma.Decimal(40),
        isFullyPaid: false,
      });

      // Simula a criação bem-sucedida no banco
      (PaymentRepository.create as jest.Mock).mockResolvedValue({
        id: "pay-123",
        amount: new Prisma.Decimal(50),
      });

      const data = { saleId: mockSaleId, amount: 50 }; // Pagando 50 dos 60 restantes
      const result = await PaymentService.create(data, mockStoreId);

      // Verificações
      expect(PaymentRepository.findSaleWithStore).toHaveBeenCalledWith(mockSaleId, mockStoreId);
      expect(PaymentRepository.create).toHaveBeenCalledWith(mockSaleId, 50);
      expect(result).toHaveProperty("id", "pay-123");
    });

    it("CT-02: Deve lançar NotFoundError se a comanda não existir", async () => {
      // Cenário: Banco não encontra a comanda e retorna null
      (PaymentRepository.findSaleWithStore as jest.Mock).mockResolvedValue(null);

      const data = { saleId: mockSaleId, amount: 50 };

      // Verificação de Erro
      await expect(PaymentService.create(data, mockStoreId)).rejects.toThrow(NotFoundError);
      await expect(PaymentService.create(data, mockStoreId)).rejects.toThrow("Comanda não encontrada.");
    });

    it("CT-03: Deve lançar BadRequest se a comanda já estiver totalmente paga", async () => {
      // Cenário: Comanda já quitada
      (PaymentRepository.findSaleWithStore as jest.Mock).mockResolvedValue({
        id: mockSaleId,
        totalAmount: new Prisma.Decimal(100),
        amountPaid: new Prisma.Decimal(100),
        isFullyPaid: true,
      });

      const data = { saleId: mockSaleId, amount: 50 };

      await expect(PaymentService.create(data, mockStoreId)).rejects.toThrow(BadRequest);
      await expect(PaymentService.create(data, mockStoreId)).rejects.toThrow("Esta comanda já está totalmente paga.");
    });

    it("CT-04: Deve lançar BadRequest se o pagamento for maior que o saldo devedor", async () => {
      // Cenário: Faltam R$ 60 para quitar
      (PaymentRepository.findSaleWithStore as jest.Mock).mockResolvedValue({
        id: mockSaleId,
        totalAmount: new Prisma.Decimal(100),
        amountPaid: new Prisma.Decimal(40),
        isFullyPaid: false,
      });

      const data = { saleId: mockSaleId, amount: 70 }; // Tentando pagar R$ 70

      await expect(PaymentService.create(data, mockStoreId)).rejects.toThrow(BadRequest);
      await expect(PaymentService.create(data, mockStoreId)).rejects.toThrow(
        /O valor do pagamento não pode ser maior que o saldo devedor da comanda/
      );
    });
  });

  describe("list()", () => {
    it("CT-05: Deve listar pagamentos passando os filtros corretos para o repositório", async () => {
      const mockFilters = { month: 4, year: 2026 };
      (PaymentRepository.list as jest.Mock).mockResolvedValue([]);

      const result = await PaymentService.list(mockFilters, mockStoreId);

      expect(PaymentRepository.list).toHaveBeenCalledWith(mockStoreId, mockFilters);
      expect(result).toEqual([]);
    });
  });
});