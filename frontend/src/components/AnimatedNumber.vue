<template>
  <span 
    class="animated-number" 
    :class="{
      'animated-number--positive': Number(displayValue) > 0,
      'animated-number--negative': Number(displayValue) < 0
    }">
    {{ displayValue }}
  </span>
</template>

<script>
import { ref, watch, onMounted } from 'vue'
import numeral from 'numeral'

export default {
  name: 'AnimatedNumber',
  props: {
    value: {
      type: [Number, String],
      required: true
    },
    duration: {
      type: Number,
      default: 1000
    },
    format: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const displayValue = ref(props.value)

    function animateNumber(start, end, duration) {
      const startTime = performance.now()
      
      function update(currentTime) {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const currentValue = start + (end - start) * progress

        displayValue.value = props.format 
          ? numeral(currentValue).format(props.format)
          : currentValue.toFixed(2)

        if (progress < 1) {
          requestAnimationFrame(update)
        }
      }

      requestAnimationFrame(update)
    }

    watch(() => props.value, (newValue, oldValue) => {
      animateNumber(Number(oldValue), Number(newValue), props.duration)
    })

    onMounted(() => {
      displayValue.value = props.format 
        ? numeral(props.value).format(props.format)
        : props.value
    })

    return {
      displayValue
    }
  }
}
</script>

<style lang="scss" scoped>
.animated-number {
  display: inline-block;
  transition: color 0.3s ease;
  font-weight: bold;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: var(--background-dark);

  &--positive {
    color: var(--secondary-color);
  }

  &--negative {
    color: var(--accent-color);
  }
}

@media (prefers-color-scheme: dark) {
  .animated-number {
    color: #ffffff;

    &--positive {
      color: var(--secondary-color);
    }

    &--negative {
      color: var(--accent-color);
    }
  }
}
</style> 