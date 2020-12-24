import { Ref, computed } from 'vue'
import { useStore } from 'vuex'
import { State, MutationTypes } from '@/store'
import { Slide } from '@/types/slides'
import { createRandomCode } from '@/utils/common'
import { copyText, readClipboard } from '@/utils/clipboard'
import { encrypt } from '@/utils/crypto'
import { KEYS } from '@/configs/hotkey'
import { message } from 'ant-design-vue'
import usePasteTextClipboardData from '@/hooks/usePasteTextClipboardData'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'

export default () => {
  const store = useStore<State>()
  const slideIndex = computed(() => store.state.slideIndex)
  const slidesLength = computed(() => store.state.slides.length)
  const currentSlide: Ref<Slide> = computed(() => store.getters.currentSlide)

  const { pasteTextClipboardData } = usePasteTextClipboardData()
  const { addHistorySnapshot } = useHistorySnapshot()

  const updateSlideIndex = (command: string) => {
    let targetIndex = 0
    if(command === KEYS.UP && slideIndex.value > 0) {
      targetIndex = slideIndex.value - 1
    }
    else if(command === KEYS.DOWN && slideIndex.value < slidesLength.value - 1) {
      targetIndex = slideIndex.value + 1
    }
    store.commit(MutationTypes.UPDATE_SLIDE_INDEX, targetIndex)
  }

  const copySlide = () => {
    const text = encrypt(JSON.stringify({
      type: 'slide',
      data: currentSlide.value,
    }))

    copyText(text).then(() => {
      store.commit(MutationTypes.SET_THUMBNAILS_FOCUS, true)
    })
  }

  const pasteSlide = () => {
    readClipboard().then(text => {
      pasteTextClipboardData(text, { onlySlide: true })
    }).catch(err => message.warning(err))
  }

  const createSlide = () => {
    const emptySlide = {
      id: createRandomCode(8),
      elements: [],
    }
    store.commit(MutationTypes.ADD_SLIDE, emptySlide)
    addHistorySnapshot()
  }

  const copyAndPasteSlide = () => {
    store.commit(MutationTypes.ADD_SLIDE, currentSlide.value)
    addHistorySnapshot()
  }

  const deleteSlide = () => {
    store.commit(MutationTypes.DELETE_SLIDE, currentSlide.value.id)
    addHistorySnapshot()
  }

  const cutSlide = () => {
    copySlide()
    deleteSlide()
  }

  return {
    updateSlideIndex,
    copySlide,
    pasteSlide,
    createSlide,
    copyAndPasteSlide,
    deleteSlide,
    cutSlide,
  }
}