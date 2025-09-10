<script lang="ts">
    import ExampleA from "./lib/ExampleA.svelte";
//  import ExampleA from "./lib/ExampleA.svelte";
    import ExampleB from "./lib/ExampleB.svelte";
//  import ExampleB from "./lib/ExampleB.svelte";
    import ExampleC from "./lib/ExampleC.svelte";
//  import ExampleC from "./lib/ExampleC.svelte";
    import ExampleD from "./lib/ExampleD.svelte";
//  import ExampleD from "./lib/ExampleD.svelte";
    import ExampleE from "./lib/ExampleE.svelte";
//  import ExampleE from "./lib/ExampleE.svelte";

    let keyboardKey: string = $state("a");
//  let keyboardKey: string = $state("a");

    const OnKeydown = (e: KeyboardEvent): void =>
//  const OnKeydown = (e: KeyboardEvent): void =>
    {
        keyboardKey = e.key;
//      keyboardKey = e.key;
    };
</script>

<svelte:window on:keydown={OnKeydown} />

<main>
    {#if      keyboardKey === "a"}
        <ExampleA></ExampleA>
    {:else if keyboardKey === "b"}
        <ExampleB></ExampleB>
    {:else if keyboardKey === "c"}
        <ExampleC></ExampleC>
    {:else if keyboardKey === "d"}
        <ExampleD></ExampleD>
    {:else if keyboardKey === "e"}
        <ExampleE></ExampleE>        
    {/if}
</main>
