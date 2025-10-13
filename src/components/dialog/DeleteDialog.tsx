import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

export default function DeleteDialog({
  config,
  setConfig,
  handleDelete,
  message,
  title,
  loading,
}: any) {
  return (
    <Dialog
      open={config.isOpen}
      onOpenChange={(open) => setConfig({ isOpen: open, id: "" })}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => setConfig({ isOpen: false, id: "" })}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDelete()}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
