// app/margin/components/ResolveModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ResolveModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Resolve Margin Call</DialogTitle>
                 <DialogDescription>
                    Placeholder content — this modal will display fix recommendations,
                    required amounts, and options to add cash or liquidate positions.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button onClick={onClose} variant="outline">
                    Close
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}
