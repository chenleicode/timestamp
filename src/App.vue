<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import type { TimestampUnit, TimezoneMode } from './types/time'
import {
  datetimeStringToTimestamp,
  millisecondsToDatetime,
  millisecondsToTimestamp,
  timestampToMilliseconds,
} from './utils/time'
import {
  DEFAULT_PREFERENCES,
  loadPreferences,
  savePreferences,
} from './utils/storage'

const storedPreferences =
  typeof window !== 'undefined'
    ? loadPreferences()
    : DEFAULT_PREFERENCES

const timezoneOptions = [
  { value: 'beijing', label: '北京 (utc + 8)' },
  { value: 'tokyo', label: '东京 (utc + 9)' },
  { value: 'seoul', label: '首尔 (utc + 9)' },
  { value: 'singapore', label: '新加坡 (utc + 8)' },
  { value: 'london', label: '伦敦 (utc ± 0/1)' },
  { value: 'new-york', label: '纽约 (utc - 5/-4)' },
  { value: 'los-angeles', label: '洛杉矶 (utc - 8/-7)' },
  { value: 'sydney', label: '悉尼 (utc + 10/+11)' },
  { value: 'utc', label: 'UTC (utc + 0)' },
] as const

const unitOptions = [
  { value: 'seconds', label: '秒' },
  { value: 'milliseconds', label: '毫秒' },
] as const

const currentTimeMs = ref(Date.now())
const timestampUnit = ref<TimestampUnit>(storedPreferences.timestampUnit)
const timezoneMode = ref<TimezoneMode>(storedPreferences.timezoneMode)
const pickedDateTime = ref(
  storedPreferences.pickedDateTime ||
    millisecondsToDatetime(currentTimeMs.value, timezoneMode.value) ||
    '',
)
const timestampValue = ref(
  storedPreferences.timestampValue ||
    millisecondsToTimestamp(currentTimeMs.value, timestampUnit.value),
)
const isTickerPaused = ref(storedPreferences.isTickerPaused)

const timeToTimestampResult = computed(() => {
  if (!pickedDateTime.value) {
    return null
  }

  const result = datetimeStringToTimestamp(pickedDateTime.value, timezoneMode.value)
  if (!result) {
    return null
  }

  return timestampUnit.value === 'seconds'
    ? result.seconds
    : result.milliseconds
})

const timestampToTimeResult = computed(() => {
  if (!timestampValue.value.trim()) {
    return null
  }

  const milliseconds = timestampToMilliseconds(
    timestampValue.value,
    timestampUnit.value,
  )

  if (milliseconds === null) {
    return null
  }

  return millisecondsToDatetime(milliseconds, timezoneMode.value)
})

const timestampError = computed(() => {
  if (!timestampValue.value.trim()) {
    return ''
  }

  return timestampToMilliseconds(timestampValue.value, timestampUnit.value) === null
    ? '请输入安全范围内的整数时间戳。'
    : ''
})

const currentTimestamp = computed(() =>
  millisecondsToTimestamp(currentTimeMs.value, timestampUnit.value),
)

const timezoneLabel = computed(
  () =>
    timezoneOptions.find((option) => option.value === timezoneMode.value)
      ?.label ?? '北京 (utc + 8)',
)

const pauseButtonText = computed(() =>
  isTickerPaused.value ? '继续' : '暂停',
)

let tickerId: number | null = null

function syncCurrentTime() {
  currentTimeMs.value = Date.now()
}

function stopTicker() {
  if (tickerId !== null) {
    window.clearInterval(tickerId)
    tickerId = null
  }
}

function startTicker() {
  stopTicker()

  if (isTickerPaused.value) {
    return
  }

  const interval = timestampUnit.value === 'seconds' ? 250 : 50
  syncCurrentTime()
  tickerId = window.setInterval(syncCurrentTime, interval)
}

function toggleTicker() {
  isTickerPaused.value = !isTickerPaused.value
}

function resetData() {
  syncCurrentTime()
  pickedDateTime.value =
    millisecondsToDatetime(currentTimeMs.value, timezoneMode.value) || ''
  timestampValue.value = millisecondsToTimestamp(
    currentTimeMs.value,
    timestampUnit.value,
  )
  isTickerPaused.value = false
}

watch(timestampUnit, (nextUnit, previousUnit) => {
  if (nextUnit === previousUnit) {
    return
  }

  const milliseconds = timestampToMilliseconds(
    timestampValue.value,
    previousUnit,
  )

  if (milliseconds !== null) {
    timestampValue.value = millisecondsToTimestamp(milliseconds, nextUnit)
  }
})

watch(timezoneMode, (nextTimezone, previousTimezone) => {
  if (nextTimezone === previousTimezone || !pickedDateTime.value) {
    return
  }

  const result = datetimeStringToTimestamp(
    pickedDateTime.value,
    previousTimezone,
  )

  if (!result) {
    return
  }

  pickedDateTime.value =
    millisecondsToDatetime(Number(result.milliseconds), nextTimezone) || ''
})

watch([timestampUnit, isTickerPaused], () => {
  startTicker()
}, { immediate: true })

watch(
  [
    pickedDateTime,
    timezoneMode,
    timestampValue,
    timestampUnit,
    isTickerPaused,
  ],
  () => {
    savePreferences({
      pickedDateTime: pickedDateTime.value,
      timezoneMode: timezoneMode.value,
      timestampValue: timestampValue.value,
      timestampUnit: timestampUnit.value,
      isTickerPaused: isTickerPaused.value,
    })
  },
  { deep: true },
)

onBeforeUnmount(stopTicker)
</script>

<template>
  <el-config-provider :locale="zhCn">
    <main class="tool-page">
      <section class="tool-shell">
      <header class="page-header">
        <div class="page-copy">
          <h1 class="page-title">时间戳转换</h1>
        </div>

        <div class="toolbar">
          <div class="unit-tabs">
            <button
              v-for="option in unitOptions"
              :key="option.value"
              type="button"
              class="unit-tab"
              :class="{ 'is-active': timestampUnit === option.value }"
              @click="timestampUnit = option.value"
            >
              {{ option.label }}
            </button>
          </div>

          <el-select
            v-model="timezoneMode"
            class="timezone-select"
          >
            <el-option
              v-for="option in timezoneOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </div>
      </header>

      <div class="content-stack">
        <section class="section-block">
          <div class="section-heading">
            <h2 class="section-title">日期转时间戳</h2>
          </div>

          <div class="section-grid">
            <div class="field-card">
              <p class="field-label">日期时间</p>
              <el-date-picker
                v-model="pickedDateTime"
                type="datetime"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择日期时间"
                :editable="false"
                :clearable="false"
                class="control-input datetime-picker"
              />
            </div>

            <div class="field-card result-card">
              <p class="field-label">
                {{ timestampUnit === 'seconds' ? '秒级时间戳' : '毫秒级时间戳' }}
              </p>
              <div class="output-value">
                {{ timeToTimestampResult ?? '--' }}
              </div>
            </div>
          </div>
        </section>

        <section class="section-block">
          <div class="section-heading">
            <h2 class="section-title">时间戳转日期</h2>
          </div>

          <div class="section-grid">
            <div class="field-card">
              <p class="field-label">时间戳</p>
              <el-input
                v-model="timestampValue"
                :placeholder="timestampUnit === 'seconds' ? '请输入秒级时间戳' : '请输入毫秒级时间戳'"
                clearable
                class="control-input"
              />
              <p
                v-if="timestampError"
                class="field-error"
              >
                {{ timestampError }}
              </p>
            </div>

            <div class="field-card result-card">
              <p class="field-label">日期时间</p>
              <div class="output-value">
                {{ timestampToTimeResult ?? '--' }}
              </div>
            </div>
          </div>
        </section>

        <footer class="status-bar">
          <div class="current-card">
            <p class="field-label">当前时间戳</p>
            <strong class="current-value">{{ currentTimestamp }}</strong>
          </div>

          <div class="action-group">
            <button
              type="button"
              class="action-button"
              @click="toggleTicker"
            >
              {{ pauseButtonText }}
            </button>
            <button
              type="button"
              class="action-button"
              @click="resetData"
            >
              重置数据
            </button>
          </div>
        </footer>
      </div>
      </section>
    </main>
  </el-config-provider>
</template>
