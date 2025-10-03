<script lang="ts">
    let file: File | null = null;
//  let file: File | null = null;
    let canvas: HTMLCanvasElement;
//  let canvas: HTMLCanvasElement;

    async function upload() {
//  async function upload() {
        if (!file) return;
//      if (!file) return;

        const formData = new FormData();
//      const formData = new FormData();
        formData.append("file", file);
//      formData.append("file", file);

        const response = await fetch("http://127.0.0.1:8000/process-image", {
//      const response = await fetch("http://127.0.0.1:8000/process-image", {
            method: "POST",
//          method: "POST",
            body: formData,
//          body: formData,
        });

        const buffer = await response.arrayBuffer();
//      const buffer = await response.arrayBuffer();
        const view = new DataView(buffer);
//      const view = new DataView(buffer);

        // Read header (width, height, channels)
        // Read header (width, height, channels)
        const width = view.getInt32(0, true);
//      const width = view.getInt32(0, true);
        const height = view.getInt32(4, true);
//      const height = view.getInt32(4, true);
        const channels = view.getInt32(8, true);
//      const channels = view.getInt32(8, true);

        // Float32 pixel data
        // Float32 pixel data
        const data = new Float32Array(buffer, 12);
//      const data = new Float32Array(buffer, 12);

        // Reinhard tonemap
        // Reinhard tonemap
        function reinhard(x: number): number {
//      function reinhard(x: number): number {
            return x / (1.0 + x);
//          return x / (1.0 + x);
        }

        const out = new Uint8ClampedArray(width * height * 4);
//      const out = new Uint8ClampedArray(width * height * 4);
        for (let i = 0; i < width * height; i++) {
//      for (let i = 0; i < width * height; i++) {
            const r = reinhard(data[i * channels + 0] || 0);
//          const r = reinhard(data[i * channels + 0] || 0);
            const g = reinhard(data[i * channels + 1] || 0);
//          const g = reinhard(data[i * channels + 1] || 0);
            const b = reinhard(data[i * channels + 2] || 0);
//          const b = reinhard(data[i * channels + 2] || 0);

            out[i * 4 + 0] = Math.min(255, Math.floor(r * 255));
//          out[i * 4 + 0] = Math.min(255, Math.floor(r * 255));
            out[i * 4 + 1] = Math.min(255, Math.floor(g * 255));
//          out[i * 4 + 1] = Math.min(255, Math.floor(g * 255));
            out[i * 4 + 2] = Math.min(255, Math.floor(b * 255));
//          out[i * 4 + 2] = Math.min(255, Math.floor(b * 255));
            out[i * 4 + 3] = 255;
//          out[i * 4 + 3] = 255;
        }

        const ctx = canvas.getContext("2d");
//      const ctx = canvas.getContext("2d");
        if (ctx) {
//      if (ctx) {
            const imageData = new ImageData(out, width, height);
//          const imageData = new ImageData(out, width, height);
            canvas.width = width;
//          canvas.width = width;
            canvas.height = height;
//          canvas.height = height;
            ctx.putImageData(imageData, 0, 0);
//          ctx.putImageData(imageData, 0, 0);
        }
    }
</script>

<!--<input type="file" on:change={(e: any) => (file = e.target.files[0])} />-->
    <input type="file" on:change={(e: any) => (file = e.target.files[0])} />
<!--<input type="file" on:change={(e: any) => (file = e.target.files[0])} />-->
<!--<button on:click={upload}>Upload & Render</button>-->
    <button on:click={upload}>Upload & Render</button>
<!--<button on:click={upload}>Upload & Render</button>-->
<!--<canvas bind:this={canvas}></canvas>-->
    <canvas bind:this={canvas}></canvas>
<!--<canvas bind:this={canvas}></canvas>-->
