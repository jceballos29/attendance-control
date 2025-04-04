import { queryClient } from "@/main";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { createOffice } from "../api";
import { CreateOfficeInput } from "../schema";
import OfficeForm from "./office-form";

function CreateOfficeDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: createOffice,
    mutationKey: ["offices", "create"],
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({ queryKey: ["offices"] });
      setIsOpen(false);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleSubmit = async (data: CreateOfficeInput) => {
    console.log(data);
    await mutation.mutateAsync(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Agregar consultorio</Button>
      </DialogTrigger>
      <DialogContent >
        <DialogHeader className="text-left mb-5">
          <DialogTitle>Agregar Consultorio</DialogTitle>
          <DialogDescription>
            Por favor, complete los campos para agregar un nuevo consultorio.
          </DialogDescription>
        </DialogHeader>
        <OfficeForm
          onSubmit={handleSubmit}
          onCancel={() => setIsOpen(false)}
          isPending={mutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}

export default CreateOfficeDialog;
