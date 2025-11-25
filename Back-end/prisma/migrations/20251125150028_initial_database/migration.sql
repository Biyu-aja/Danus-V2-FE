-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "nama_lengkap" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "nomor_telepon" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "password" TEXT NOT NULL,
    "catatan" TEXT,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Absen" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "tanggal_absen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "setorKepadaId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "keterangan" TEXT,

    CONSTRAINT "Absen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Detail_absen" (
    "id" SERIAL NOT NULL,
    "id_absen" INTEGER NOT NULL,
    "id_stok" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "total_harga" INTEGER NOT NULL,

    CONSTRAINT "Detail_absen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stok" (
    "id" SERIAL NOT NULL,
    "id_barang" INTEGER NOT NULL,
    "harga" INTEGER NOT NULL,
    "stok" INTEGER NOT NULL,
    "modal" INTEGER NOT NULL,
    "keterangan" TEXT,

    CONSTRAINT "Stok_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Barang" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "keterangan" TEXT,

    CONSTRAINT "Barang_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- AddForeignKey
ALTER TABLE "Absen" ADD CONSTRAINT "Absen_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Absen" ADD CONSTRAINT "Absen_setorKepadaId_fkey" FOREIGN KEY ("setorKepadaId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Detail_absen" ADD CONSTRAINT "Detail_absen_id_absen_fkey" FOREIGN KEY ("id_absen") REFERENCES "Absen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Detail_absen" ADD CONSTRAINT "Detail_absen_id_stok_fkey" FOREIGN KEY ("id_stok") REFERENCES "Stok"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stok" ADD CONSTRAINT "Stok_id_barang_fkey" FOREIGN KEY ("id_barang") REFERENCES "Barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
