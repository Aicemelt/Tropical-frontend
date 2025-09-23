/**
 * @fileoverview 로딩 컴포넌트
 * @description 다양한 크기와 메시지를 지원하는 로딩 인디케이터
 * @author 신동준
 * @since 2025-09-19
 * @version 1.0.0
 */

import React from 'react';
import PropTypes from 'prop-types';
import './Loading.scss';

/**
 * @component Loading
 * @description 로딩 상태를 표시하는 컴포넌트
 *
 * @param {Object} props - 컴포넌트 props
 * @param {'small'|'medium'|'large'} [props.size='medium'] - 로딩 크기
 * @param {string} [props.message] - 로딩 메시지
 * @param {string} [props.className] - 추가 CSS 클래스
 *
 * @returns {JSX.Element} Loading 컴포넌트
 *
 * @example
 * <Loading size="small" message="데이터를 불러오는 중..." />
 *
 * @since 2025-09-19
 * @author 신동준
 */
const Loading = ({
  size = 'medium',
  message = '로딩 중...',
  className = ''
}) => {
  const containerClassName = [
    'loading',
    `loading--${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClassName} data-testid="loading">
      <div className="loading__spinner">
        <div className="loading__dot loading__dot--1"></div>
        <div className="loading__dot loading__dot--2"></div>
        <div className="loading__dot loading__dot--3"></div>
      </div>
      {message && (
        <p className="loading__message">
          {message}
        </p>
      )}
    </div>
  );
};

Loading.propTypes = {
  /** 로딩 크기 */
  size: PropTypes.oneOf(['small', 'medium', 'large']),

  /** 로딩 메시지 */
  message: PropTypes.string,

  /** 추가 CSS 클래스 */
  className: PropTypes.string
};

Loading.defaultProps = {
  size: 'medium',
  message: '로딩 중...',
  className: ''
};

export default Loading;
