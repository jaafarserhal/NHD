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
import { BoxTypeEnum } from "src/common/Enums";

interface DatesTableProps {
  dates: DateType[]; // from API
  value: DatesProduct[]; // current form state
  onChange: (updated: DatesProduct[]) => void;
  onPriceChange?: (totalPrice: number) => void;
  loading?: boolean;
  productId?: number;
  typeId: number;
}


export default function DatesTable({
  dates,
  value,
  onChange,
  onPriceChange,
  loading = false,
  productId,
  typeId,
}: DatesTableProps) {
  const [rows, setRows] = useState<DatesProduct[]>([]);

  // Determine checkbox visibility and default value based on typeId
  const shouldShowCheckbox = typeId === BoxTypeEnum.AssortedDate;
  const getDefaultIsFilled = () => {
    if (typeId === BoxTypeEnum.PlainDate) return false;
    if (typeId === BoxTypeEnum.FilledDate) return true;
    return false; // Default for AssortedDate
  };


  useEffect(() => {
    const defaultIsFilled = getDefaultIsFilled();
    const initial: DatesProduct[] = dates.map((d) => {
      const existing = value.find((v) => v.dateId === d.id);
      return (
        existing || {
          prdId: productId || 0,
          dateId: d.id as number,
          quantity: 0,
          isFilled: defaultIsFilled,
        }
      );
    });
    setRows(initial);
  }, [dates, value, productId, typeId]);

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

    // Calculate and emit total price
    if (field === "quantity" && onPriceChange) {
      const totalPrice = updated.reduce((sum, row) => {
        const dateInfo = dates.find((d) => d.id === row.dateId);
        return sum + (row.quantity * (dateInfo?.price || 0));
      }, 0);
      onPriceChange(totalPrice);
    }
  };

  // Calculate initial price on mount/update
  useEffect(() => {
    if (onPriceChange && rows.length > 0) {
      const totalPrice = rows.reduce((sum, row) => {
        const dateInfo = dates.find((d) => d.id === row.dateId);
        return sum + (row.quantity * (dateInfo?.price || 0));
      }, 0);
      onPriceChange(totalPrice);
    }
  }, [rows, dates, onPriceChange]);

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
          {shouldShowCheckbox && <TableCell>Filled</TableCell>}
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
                  value={row.quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    updateRow(index, "quantity", isNaN(val) ? 0 : val);
                  }}
                  sx={{
                    '& input[type=number]': {
                      '-moz-appearance': 'textfield',
                    },
                    '& input[type=number]::-webkit-outer-spin-button': {
                      '-webkit-appearance': 'none',
                      margin: 0,
                    },
                    '& input[type=number]::-webkit-inner-spin-button': {
                      '-webkit-appearance': 'none',
                      margin: 0,
                    },
                  }}
                />
              </TableCell>
              {shouldShowCheckbox && (
                <TableCell>
                  <Checkbox
                    checked={row.isFilled}
                    disabled={row.quantity === 0}
                    onChange={(e) =>
                      updateRow(index, "isFilled", e.target.checked)
                    }
                  />
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}