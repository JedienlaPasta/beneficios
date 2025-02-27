"use server";

export async function crearCampaña(formData: FormData) {
    const rawFormData = {
        nombre: formData.get("nombre"),
        fechaInicio: formData.get("fechaInicio"),
        fechaTermino: formData.get("fechaTermino"),
        descripcion: formData.get("descripcion")
    };
    console.log(rawFormData);
}