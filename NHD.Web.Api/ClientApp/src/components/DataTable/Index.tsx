import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Box,
  CircularProgress,
} from "@mui/material";
import { Date as DateType, DatesProduct } from "../../portal/models/Types";
import { BoxTypeEnum } from "src/common/Enums";

interface DatesTableProps {
  dates: DateType[];
  value: DatesProduct[];
  onChange: (updated: DatesProduct[]) => void;

  loading?: boolean;
  productId?: number;
  typeId: number;
}

interface RowState {
  dateId: number;
  plainQuantity: number;
  filledQuantity: number;
}

export default function DatesTable({
  dates,
  value,
  onChange,
  loading = false,
  productId,
  typeId,
}: DatesTableProps) {
  const [rows, setRows] = useState<RowState[]>([]);

  // Initialize rows with quantities for both types
  useEffect(() => {
    const initial: RowState[] = dates.map((d) => {
      const plain = value.find(
        (v) => v.dateId === d.id && v.isFilled === false
      );
      const filled = value.find(
        (v) => v.dateId === d.id && v.isFilled === true
      );

      return {
        dateId: d.id as number,
        plainQuantity: plain?.quantity || 0,
        filledQuantity: filled?.quantity || 0,
      };
    });
    setRows(initial);
  }, [dates, value, productId]);

  const handleQuantityChange = (
    index: number,
    field: "plainQuantity" | "filledQuantity",
    val: number
  ) => {
    const updated = rows.map((r, i) =>
      i === index ? { ...r, [field]: val } : r
    );
    setRows(updated);

    // Convert to DatesProduct[]
    const result: DatesProduct[] = updated.flatMap((r) => {
      const items: DatesProduct[] = [];

      if (typeId !== BoxTypeEnum.FilledDate && r.plainQuantity > 0) {
        items.push({
          prdId: productId || 0,
          dateId: r.dateId,
          quantity: r.plainQuantity,
          isFilled: false,
        });
      }

      if (typeId !== BoxTypeEnum.PlainDate && r.filledQuantity > 0) {
        items.push({
          prdId: productId || 0,
          dateId: r.dateId,
          quantity: r.filledQuantity,
          isFilled: true,
        });
      }

      return items;
    });

    onChange(result);
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

  const showPlain = typeId !== BoxTypeEnum.FilledDate;
  const showFilled = typeId !== BoxTypeEnum.PlainDate;

  // Calculate totals
  const totalPlain = rows.reduce((sum, row) => sum + row.plainQuantity, 0);
  const totalFilled = rows.reduce((sum, row) => sum + row.filledQuantity, 0);
  const grandTotal = totalPlain + totalFilled;

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Date Type</TableCell>
          {showPlain && <TableCell>Plain Qty</TableCell>}
          {showFilled && <TableCell>Filled Qty</TableCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, index) => {
          const dateInfo = dates.find((d) => d.id === row.dateId);
          return (
            <TableRow key={row.dateId}>
              <TableCell>{dateInfo?.nameEn || "Unknown"}</TableCell>

              {showPlain && (
                <TableCell>
                  <TextField
                    type="number"
                    variant="standard"
                    value={row.plainQuantity}
                    onChange={(e) =>
                      handleQuantityChange(
                        index,
                        "plainQuantity",
                        parseInt(e.target.value, 10) || 0
                      )
                    }
                    sx={{
                      "& input[type=number]": {
                        "-moz-appearance": "textfield",
                      },
                      "& input[type=number]::-webkit-outer-spin-button": {
                        "-webkit-appearance": "none",
                        margin: 0,
                      },
                      "& input[type=number]::-webkit-inner-spin-button": {
                        "-webkit-appearance": "none",
                        margin: 0,
                      },
                    }}
                  />
                </TableCell>
              )}

              {showFilled && (
                <TableCell>
                  <TextField
                    type="number"
                    variant="standard"
                    value={row.filledQuantity}
                    onChange={(e) =>
                      handleQuantityChange(
                        index,
                        "filledQuantity",
                        parseInt(e.target.value, 10) || 0
                      )
                    }
                    sx={{
                      "& input[type=number]": {
                        "-moz-appearance": "textfield",
                      },
                      "& input[type=number]::-webkit-outer-spin-button": {
                        "-webkit-appearance": "none",
                        margin: 0,
                      },
                      "& input[type=number]::-webkit-inner-spin-button": {
                        "-webkit-appearance": "none",
                        margin: 0,
                      },
                    }}
                  />
                </TableCell>
              )}
            </TableRow>
          );
        })}

        {/* Total Row */}
        <TableRow sx={{ borderTop: 2, borderColor: "divider" }}>
          <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
            Total Quantity
          </TableCell>
          {showPlain && (
            <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
              {totalPlain}
            </TableCell>
          )}
          {showFilled && (
            <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
              {totalFilled}
            </TableCell>
          )}
        </TableRow>

        {/* Grand Total Row (only if both columns are shown) */}
        {showPlain && showFilled && (
          <TableRow>
            <TableCell
              colSpan={3}
              align="right"
              sx={{
                fontWeight: "bold",
                fontSize: "1.1rem",
                bgcolor: "action.hover",
                py: 1.5
              }}
            >
              Grand Total: {grandTotal}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}