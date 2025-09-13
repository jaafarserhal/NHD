import React, { useState, ChangeEvent } from 'react';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  Typography,
  IconButton,
  Tooltip,
  Box
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

type ColumnDefinition<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
};

type GenericTableProps<T> = {
  data: T[];
  idKey: keyof T;
  columns: ColumnDefinition<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
};

function GenericTable<T extends Record<string, any>>({
  data,
  idKey,
  columns,
  onEdit,
  onDelete
}: GenericTableProps<T>) {
  const [selected, setSelected] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const handleSelectAll = (event: ChangeEvent<HTMLInputElement>) => {
    setSelected(event.target.checked ? data.map((row) => row[idKey]) : []);
  };

  const handleSelectOne = (event: ChangeEvent<HTMLInputElement>, id: any) => {
    if (!selected.includes(id)) {
      setSelected((prev) => [...prev, id]);
    } else {
      setSelected((prev) => prev.filter((selectedId) => selectedId !== id));
    }
  };

  const handlePageChange = (_: unknown, newPage: number) => setPage(newPage);
  const handleLimitChange = (event: ChangeEvent<HTMLInputElement>) => {
    setLimit(parseInt(event.target.value));
    setPage(0);
  };

  const paginatedData = data.slice(page * limit, page * limit + limit);
  const allSelected = selected.length === data.length;
  const someSelected = selected.length > 0 && selected.length < data.length;

  return (
    <Card>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={handleSelectAll}
                />
              </TableCell>
              {columns.map((col) => (
                <TableCell key={col.key.toString()} align={col.align || 'left'}>
                  {col.label}
                </TableCell>
              ))}
              {(onEdit || onDelete) && (
                <TableCell align="right">Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row) => {
              const rowId = row[idKey];
              const isSelected = selected.includes(rowId);
              return (
                <TableRow key={rowId} hover selected={isSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isSelected}
                      onChange={(e) => handleSelectOne(e, rowId)}
                    />
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell key={col.key.toString()} align={col.align || 'left'}>
                      {col.render ? col.render(row) : row[col.key]}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableCell align="right">
                      {onEdit && (
                        <Tooltip title="Edit" arrow>
                          <IconButton onClick={() => onEdit(row)} color="primary">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {onDelete && (
                        <Tooltip title="Delete" arrow>
                          <IconButton onClick={() => onDelete(row)} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Box p={2}>
        <TablePagination
          component="div"
          count={data.length}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={limit}
          onRowsPerPageChange={handleLimitChange}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Box>
    </Card>
  );
}

export default GenericTable;
