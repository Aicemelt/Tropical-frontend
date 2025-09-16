import {create} from 'zustand';

// 인증 관련 상태값 중앙 관리
export const useModalStore = create((set) =>({
    isOpen: false,            // 모달 열림/닫힘 상태
    modalType: null,          // 여러 모달이 있다면 타입으로 구분
    openModal: (type) => set({ isOpen: true, modalType: type }),
    closeModal: () => set({ isOpen: false, modalType: null }),
}));