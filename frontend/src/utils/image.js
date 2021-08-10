export const generateBase64FromImage = imageFile => {
    const reader = new FileReader();
    const promise = new Promise((res, rej) => {
        reader.onload = e => res(e.target.result);
        reader.onerror = err => rej(err);
    });

    reader.readAsDataURL(imageFile);
    return promise;
}