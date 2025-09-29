import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  TextField,
  Box,
  CircularProgress,
} from "@mui/material";
import { Date as DateType, DatesProduct } from "../../portal/models/Types";

interface DatesTableProps {
  dates: DateType[]; // from API
  value: DatesProduct[]; // current form state
  onChange: (updated: DatesProduct[]) => void;
  loading?: boolean;
  productId?: number;
}

export default function DatesTable({
  dates,
  value,
  onChange,
  loading = false,
  productId,
}: DatesTableProps) {
  const [rows, setRows] = useState<DatesProduct[]>([]);

  // ✅ Build initial state based on available dates + existing values
  useEffect(() => {
    const initial: DatesProduct[] = dates.map((d) => {
      const existing = value.find((v) => v.dateId === d.id);
      return (
        existing || {
          prdId: productId || 0,
          dateId: d.id as number,
          quantity: 0,
          isFilled: false,
        }
      );
    });
    setRows(initial);
  }, [dates, value, productId]);

  const updateRow = (
    index: number,
    field: keyof DatesProduct,
    val: number | boolean
  ) => {
    const updated = rows.map((r, i) =>
      i === index ? { ...r, [field]: val } : r
    );
    setRows(updated);
    onChange(updated);
  };

  if (loading) {
    return (
      <Box textAlign="center" my={2}>
        <CircularProgress />
      </Box>
    );
  }

  if (dates.length === 0) {
    return <Box>No dates available</Box>;
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Date Type</TableCell>
          <TableCell>Quantity</TableCell>
          <TableCell>Filled</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, index) => {
          const dateInfo = dates.find((d) => d.id === row.dateId);
          return (
            <TableRow key={row.dateId}>
              <TableCell>{dateInfo?.nameEn || "Unknown"}</TableCell>
              <TableCell>
                <TextField
                  type="number"
                  variant="standard"
                  value={row.quantity || ""}
                  onChange={(e) =>
                    updateRow(
                      index,
                      "quantity",
                      parseInt(e.target.value, 10) || 0
                    )
                  }
                  inputProps={{ min: 0 }}
                />
              </TableCell>
              <TableCell>
                <Checkbox
                  checked={row.isFilled}
                  onChange={(e) =>
                    updateRow(index, "isFilled", e.target.checked)
                  }
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
