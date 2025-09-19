import {create} from 'zustand';

// 인증 관련 상태값 중앙 관리
export const useModalStore = create((set) =>({
    isOpen: false,            // 모달 열림/닫힘 상태
    modalType: null,          // 여러 모달이 있다면 타입으로 구분
    modalData: null,          // 모달에 전달할 데이터 (날짜, 초기값 등)
    openModal: (type, data = null) => set({ isOpen: true, modalType: type, modalData: data }),
    closeModal: () => set({ isOpen: false, modalType: null, modalData: null }),
}));