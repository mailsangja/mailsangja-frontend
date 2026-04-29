import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"

interface EmailListLoadingRowsProps {
  count?: number
}

export function EmailListLoadingRows({ count = 10 }: EmailListLoadingRowsProps) {
  return Array.from({ length: count }).map((_, index) => (
    <TableRow key={index}>
      <TableCell className="w-10">
        <Skeleton className="size-2.5 rounded-full" />
      </TableCell>
      <TableCell className="w-10">
        <Skeleton className="size-2.5 rounded-full" />
      </TableCell>
      <TableCell className="w-[22%]">
        <Skeleton className="h-5 w-28" />
      </TableCell>
      <TableCell className="w-[58%]">
        <Skeleton className="h-5 w-full" />
      </TableCell>
      <TableCell className="hidden w-14 text-center md:table-cell">
        <Skeleton className="mx-auto size-4 rounded-full" />
      </TableCell>
      <TableCell className="w-24 text-right">
        <Skeleton className="ml-auto h-5 w-16" />
      </TableCell>
    </TableRow>
  ))
}
