import { type ColumnDef } from "@tanstack/react-table";

type Pasillo = {
  id: number;
  nombre: string;
  cantidad: string;
  fecha: Date;
};

export const columns: ColumnDef<Pasillo>[] = [
  {
    accessorKey: "id",
    header: "Numero Pasillo",
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "cantidad",
    header: "Cantidad",
  },
  {
    accessorKey: "fecha",
    header: "Fecha",
  },
];
