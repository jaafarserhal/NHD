import React, { useState, useEffect, ChangeEvent } from 'react';
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
  Box,
  CircularProgress,
  Backdrop
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { LinkIcon } from 'lucide-react';

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
  onManage?: (item: T) => void;
  currentPage?: number;
  pageSize?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  disableInternalPagination?: boolean;
  loadingDelay?: number; // in ms
};

function GenericTable<T extends Record<string, any>>({
  data,
  idKey,
  columns,
  onEdit,
  onDelete,
  onManage,
  currentPage: externalPage,
  pageSize: externalPageSize,
  totalCount: externalTotalCount,
  onPageChange: externalOnPageChange,
  onPageSizeChange: externalOnPageSizeChange,
  disableInternalPagination = false,
  loadingDelay = 1000
}: GenericTableProps<T>) {
  const [selected, setSelected] = useState<any[]>([]);
  const [internalPage, setInternalPage] = useState(0);
  const [internalLimit, setInternalLimit] = useState(10);
  const [loading, setLoading] = useState(true);

  const page = disableInternalPagination ? (externalPage ?? 0) : internalPage;
  const limit = disableInternalPagination ? (externalPageSize ?? 10) : internalLimit;
  const totalCount = disableInternalPagination ? (externalTotalCount ?? data.length) : data.length;

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, loadingDelay);

    return () => clearTimeout(timer);
  }, [data, page, limit, loadingDelay]);

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

  const handlePageChange = (_: unknown, newPage: number) => {
    if (disableInternalPagination && externalOnPageChange) {
      externalOnPageChange(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  const handleLimitChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(event.target.value);
    if (disableInternalPagination && externalOnPageSizeChange) {
      externalOnPageSizeChange(newLimit);
    } else {
      setInternalLimit(newLimit);
      setInternalPage(0);
    }
  };

  const displayData = disableInternalPagination
    ? data
    : data.slice(page * limit, page * limit + limit);

  const allSelected = selected.length === data.length;
  const someSelected = selected.length > 0 && selected.length < data.length;

  return (
    <Card>
      {loading && (
        <Backdrop open={loading} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
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
              {(onEdit || onDelete) && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading &&
              displayData.map((row) => {
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
                        {onManage && (
                          <Tooltip title="Manage" arrow>
                            <IconButton onClick={() => onManage(row)} color="default">
                              <LinkIcon fontSize="small" />
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
          count={totalCount}
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
