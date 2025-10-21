import { assert } from "@std/assert";
import { MerchantService } from "../../services/index.ts";
import { MerchantRepository } from "../../repositories/merchantRepository.ts";
import { TagRepository } from "../../repositories/tagRepository.ts";
import { Merchant, Tag } from "@shared/entities";

// Mock repositories for testing
class MockMerchantRepository extends MerchantRepository {
  private merchants: Merchant[] = [];

  override save(merchant: Merchant): Promise<void> {
    const existingIndex = this.merchants.findIndex((m) => m.id === merchant.id);
    if (existingIndex >= 0) {
      this.merchants[existingIndex] = merchant;
    } else {
      this.merchants.push(merchant);
    }
    return Promise.resolve();
  }

  override findById(id: string): Promise<Merchant | null> {
    return Promise.resolve(this.merchants.find((m) => m.id === id) || null);
  }

  override findByName(name: string): Promise<Merchant | null> {
    return Promise.resolve(this.merchants.find((m) => m.name === name) || null);
  }
}

class MockTagRepository extends TagRepository {
  private tags: Tag[] = [];

  override save(tag: Tag): Promise<void> {
    const existingIndex = this.tags.findIndex((t) => t.id === tag.id);
    if (existingIndex >= 0) {
      this.tags[existingIndex] = tag;
    } else {
      this.tags.push(tag);
    }
    return Promise.resolve();
  }

  override findById(id: string): Promise<Tag | null> {
    return Promise.resolve(this.tags.find((t) => t.id === id) || null);
  }

  override findAll(): Promise<Tag[]> {
    return Promise.resolve([...this.tags]);
  }

  override findByName(name: string): Promise<Tag | null> {
    return Promise.resolve(this.tags.find((t) => t.name === name) || null);
  }
}

Deno.test("MerchantService - can be instantiated", () => {
  const merchantRepo = new MockMerchantRepository();
  const tagRepo = new MockTagRepository();
  const service = new MerchantService(merchantRepo, tagRepo);
  assert(service instanceof MerchantService);
});

Deno.test("MerchantService - createMerchant validates input", async () => {
  const merchantRepo = new MockMerchantRepository();
  const tagRepo = new MockTagRepository();
  const service = new MerchantService(merchantRepo, tagRepo);

  // Test invalid input
  try {
    await service.createMerchant({ name: "" });
    assert(false, "Should have thrown validation error");
  } catch (error) {
    assert(error instanceof Error);
  }
});

Deno.test(
  "MerchantService - createMerchant creates valid merchant",
  async () => {
    const merchantRepo = new MockMerchantRepository();
    const tagRepo = new MockTagRepository();
    const service = new MerchantService(merchantRepo, tagRepo);

    const result = await service.createMerchant({
      name: "Test Merchant",
      location: "Test Location",
    });

    assert(result.id.length > 0);
    assert(result.name === "Test Merchant");
    assert(result.location === "Test Location");
    assert(result.isActive === true);
  }
);

Deno.test("MerchantService - createMerchant prevents duplicates", async () => {
  const merchantRepo = new MockMerchantRepository();
  const tagRepo = new MockTagRepository();
  const service = new MerchantService(merchantRepo, tagRepo);

  // Create first merchant
  await service.createMerchant({ name: "Test Merchant" });

  // Try to create duplicate
  try {
    await service.createMerchant({ name: "Test Merchant" });
    assert(false, "Should have thrown duplicate error");
  } catch (error) {
    assert(error instanceof Error);
    assert(error.message.includes("already exists"));
  }
});

Deno.test("MerchantService - updateMerchant validates input", async () => {
  const merchantRepo = new MockMerchantRepository();
  const tagRepo = new MockTagRepository();
  const service = new MerchantService(merchantRepo, tagRepo);

  // Create a merchant first
  const merchant = await service.createMerchant({ name: "Test Merchant" });

  // Test invalid input
  try {
    await service.updateMerchant(merchant.id, { name: "" });
    assert(false, "Should have thrown validation error");
  } catch (error) {
    assert(error instanceof Error);
  }
});

Deno.test(
  "MerchantService - updateMerchant updates existing merchant",
  async () => {
    const merchantRepo = new MockMerchantRepository();
    const tagRepo = new MockTagRepository();
    const service = new MerchantService(merchantRepo, tagRepo);

    // Create a merchant
    const merchant = await service.createMerchant({ name: "Original Name" });

    // Update it
    const updated = await service.updateMerchant(merchant.id, {
      name: "Updated Name",
      location: "New Location",
    });

    assert(updated.id === merchant.id);
    assert(updated.name === "Updated Name");
    assert(updated.location === "New Location");
  }
);

Deno.test(
  "MerchantService - updateMerchant prevents name conflicts",
  async () => {
    const merchantRepo = new MockMerchantRepository();
    const tagRepo = new MockTagRepository();
    const service = new MerchantService(merchantRepo, tagRepo);

    // Create two merchants
    const merchant1 = await service.createMerchant({ name: "Merchant 1" });
    const merchant2 = await service.createMerchant({ name: "Merchant 2" });

    // Try to rename merchant1 to merchant2's name
    try {
      await service.updateMerchant(merchant1.id, { name: "Merchant 2" });
      assert(false, "Should have thrown conflict error");
    } catch (error) {
      assert(error instanceof Error);
      assert(error.message.includes("already exists"));
    }
  }
);

Deno.test("MerchantService - listTags returns all tags", async () => {
  const merchantRepo = new MockMerchantRepository();
  const tagRepo = new MockTagRepository();
  const service = new MerchantService(merchantRepo, tagRepo);

  // Create some tags
  await service.createTag({ name: "Tag 1" });
  await service.createTag({ name: "Tag 2" });

  const tags = await service.listTags();
  assert(tags.length === 2);
  assert(tags.some((t) => t.name === "Tag 1"));
  assert(tags.some((t) => t.name === "Tag 2"));
});

Deno.test("MerchantService - createTag creates valid tag", async () => {
  const merchantRepo = new MockMerchantRepository();
  const tagRepo = new MockTagRepository();
  const service = new MerchantService(merchantRepo, tagRepo);

  const result = await service.createTag({
    name: "Test Tag",
    color: "#ff0000",
  });

  assert(result.id.length > 0);
  assert(result.name === "Test Tag");
  assert(result.color === "#ff0000");
  assert(result.isActive === true);
});

Deno.test("MerchantService - createTag prevents duplicates", async () => {
  const merchantRepo = new MockMerchantRepository();
  const tagRepo = new MockTagRepository();
  const service = new MerchantService(merchantRepo, tagRepo);

  // Create first tag
  await service.createTag({ name: "Test Tag" });

  // Try to create duplicate
  try {
    await service.createTag({ name: "Test Tag" });
    assert(false, "Should have thrown duplicate error");
  } catch (error) {
    assert(error instanceof Error);
    assert(error.message.includes("already exists"));
  }
});
