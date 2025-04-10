import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin", 10);
  await prisma.admin.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
    },
  });

  console.log("✅ Admin user created!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
