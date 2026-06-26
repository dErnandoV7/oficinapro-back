import { SaleService } from "../../modules/sale/sale.service";
import { SaleRepository } from "../../modules/sale/sale.repository";
import { ClientRepository } from "../../modules/client/client.repository";
import { ProductServiceRepository } from "../../modules/product/product.repository";
import { BadRequest, NotFoundError } from "../../common/utils/error";

// 1. Mocks dos Repositórios
jest.mock("../../modules/sale/sale.repository", () => ({
  SaleRepository: {
    create: jest.fn(),
    list: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.mock("../../modules/client/client.repository", () => ({
  ClientRepository: {
    findWithStore: jest.fn(),
  },
}));

jest.mock("../../modules/product/product.repository", () => ({
  ProductServiceRepository: {
    findById: jest.fn(),
  },
}));

describe("SaleService", () => {
  const mockStoreId = "store-123";
  const mockClientId = "client-123";
  const mockCatalogItemId = "prod-123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create()", () => {
    it("CT-06: Deve criar comanda com sucesso vinculada a cliente e item manual", async () => {
      (ClientRepository.findWithStore as jest.Mock).mockResolvedValue({ id: mockClientId, isActive: true });
      (SaleRepository.create as jest.Mock).mockResolvedValue({ id: "sale-1" });

      const data = {
        clientId: mockClientId,
        items: [{ customDesc: "Serviço Extra", quantity: 2, unitPrice: 50 }], // Total: 100
      };

      const result = await SaleService.create(data, mockStoreId);

      expect(ClientRepository.findWithStore).toHaveBeenCalledWith(mockClientId, mockStoreId);
      expect(SaleRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        totalAmount: 100,
        clientId: mockClientId,
      }));
      expect(result).toHaveProperty("id", "sale-1");
    });

    it("CT-07: Deve criar comanda buscando o preço do item no catálogo", async () => {
      (ClientRepository.findWithStore as jest.Mock).mockResolvedValue({ id: mockClientId, isActive: true });
      (ProductServiceRepository.findById as jest.Mock).mockResolvedValue({
        id: mockCatalogItemId,
        name: "Óleo de Motor",
        isActive: true,
        type: "PRODUCT",
        stock: 10,
        sellPrice: 35.5,
      });
      (SaleRepository.create as jest.Mock).mockResolvedValue({ id: "sale-2" });

      const data = {
        clientId: mockClientId,
        items: [{ catalogItemId: mockCatalogItemId, quantity: 2 }], // 2 * 35.5 = 71
      };

      await SaleService.create(data, mockStoreId);

      expect(SaleRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        totalAmount: 71,
      }));
    });

    it("CT-08: Deve criar comanda com cliente avulso (sem clientId)", async () => {
      (SaleRepository.create as jest.Mock).mockResolvedValue({ id: "sale-avulsa" });

      const data = {
        customName: "João Avulso",
        items: [{ customDesc: "Reparo", quantity: 1, unitPrice: 150 }],
      };

      await SaleService.create(data, mockStoreId);

      // Garante que não buscou cliente no banco
      expect(ClientRepository.findWithStore).not.toHaveBeenCalled(); 
      expect(SaleRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        customName: "João Avulso",
        totalAmount: 150,
      }));
    });

    it("CT-09: Deve lançar erro se o cliente fornecido não existir", async () => {
      (ClientRepository.findWithStore as jest.Mock).mockResolvedValue(null);

      const data = { clientId: mockClientId, items: [] };

      await expect(SaleService.create(data, mockStoreId)).rejects.toThrow(NotFoundError);
      await expect(SaleService.create(data, mockStoreId)).rejects.toThrow("Cliente não encontrado.");
    });

    it("CT-10: Deve lançar erro ao tentar abrir venda para cliente inativo", async () => {
      (ClientRepository.findWithStore as jest.Mock).mockResolvedValue({ id: mockClientId, isActive: false });

      const data = { clientId: mockClientId, items: [] };

      await expect(SaleService.create(data, mockStoreId)).rejects.toThrow(BadRequest);
      await expect(SaleService.create(data, mockStoreId)).rejects.toThrow("Não é possível abrir venda para um cliente inativo.");
    });

    it("CT-11: Deve lançar erro se o produto do catálogo não existir", async () => {
      (ClientRepository.findWithStore as jest.Mock).mockResolvedValue({ id: mockClientId, isActive: true });
      (ProductServiceRepository.findById as jest.Mock).mockResolvedValue(null);

      const data = { clientId: mockClientId, items: [{ catalogItemId: mockCatalogItemId, quantity: 1 }] };

      await expect(SaleService.create(data, mockStoreId)).rejects.toThrow(NotFoundError);
    });

    it("CT-12: Deve lançar erro se o produto do catálogo estiver inativo", async () => {
      (ClientRepository.findWithStore as jest.Mock).mockResolvedValue({ id: mockClientId, isActive: true });
      (ProductServiceRepository.findById as jest.Mock).mockResolvedValue({
        id: mockCatalogItemId,
        name: "Pneu Antigo",
        isActive: false, 
      });

      const data = { clientId: mockClientId, items: [{ catalogItemId: mockCatalogItemId, quantity: 1 }] };

      await expect(SaleService.create(data, mockStoreId)).rejects.toThrow(BadRequest);
      await expect(SaleService.create(data, mockStoreId)).rejects.toThrow(/está inativo/);
    });

    it("CT-13: Deve lançar erro de estoque insuficiente para produtos", async () => {
      (ClientRepository.findWithStore as jest.Mock).mockResolvedValue({ id: mockClientId, isActive: true });
      (ProductServiceRepository.findById as jest.Mock).mockResolvedValue({
        id: mockCatalogItemId,
        name: "Filtro de Ar",
        isActive: true,
        type: "PRODUCT",
        stock: 1, // Apenas 1 no estoque
      });

      const data = { clientId: mockClientId, items: [{ catalogItemId: mockCatalogItemId, quantity: 5 }] }; // Pedindo 5

      await expect(SaleService.create(data, mockStoreId)).rejects.toThrow(BadRequest);
      await expect(SaleService.create(data, mockStoreId)).rejects.toThrow(/Estoque insuficiente/);
    });

    it("CT-14: Deve usar o preço customizado (unitPrice) se fornecido, ignorando o preço do catálogo", async () => {
      (ClientRepository.findWithStore as jest.Mock).mockResolvedValue({ id: mockClientId, isActive: true });
      (ProductServiceRepository.findById as jest.Mock).mockResolvedValue({
        id: mockCatalogItemId,
        isActive: true,
        type: "SERVICE",
        sellPrice: 100, // Preço padrão
      });
      (SaleRepository.create as jest.Mock).mockResolvedValue({ id: "sale-custom" });

      const data = {
        clientId: mockClientId,
        items: [{ catalogItemId: mockCatalogItemId, quantity: 1, unitPrice: 80 }], // Preço customizado: 80
      };

      await SaleService.create(data, mockStoreId);

      expect(SaleRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        totalAmount: 80, // Total deve refletir o preço customizado
      }));
    });
  });

  describe("getById()", () => {
    it("CT-15: Deve retornar a comanda com sucesso", async () => {
      const mockSale = { id: "sale-123", totalAmount: 100 };
      (SaleRepository.findById as jest.Mock).mockResolvedValue(mockSale);

      const result = await SaleService.getById("sale-123", mockStoreId);

      expect(SaleRepository.findById).toHaveBeenCalledWith("sale-123", mockStoreId);
      expect(result).toEqual(mockSale);
    });

    it("CT-16: Deve lançar NotFoundError se a comanda não for encontrada pelo ID", async () => {
      (SaleRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(SaleService.getById("sale-fake", mockStoreId)).rejects.toThrow(NotFoundError);
      await expect(SaleService.getById("sale-fake", mockStoreId)).rejects.toThrow("Venda não encontrada.");
    });
  });
});