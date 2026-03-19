# SMVD CMS 프로젝트 - 코드 분석 평가 리포트

> **분석일**: 2026-03-19
> **프로젝트**: 숙명여자대학교 시각영상디자인과 웹사이트 (SMVD CMS)
> **Tech Stack**: Next.js 15 + React 19 + TypeScript 5.9 + PostgreSQL + Prisma ORM

---

## 1. 프로젝트 개요

| 항목 | 수치 |
|------|------|
| **총 소스 파일** | 283 TS/TSX |
| **총 코드 라인** | 65,045 lines |
| **컴포넌트** | 92개 (Admin 47 / Public 41 / Common 4) |
| **API 라우트** | 56개 |
| **커스텀 훅** | 21개 |
| **유틸리티 모듈** | 25개 |
| **DB 모델** | 14개 (Prisma) |
| **E2E 테스트** | 5개 파일 (535 lines) |

### 핵심 기능
- **6개 공개 페이지**: Home, About, Curriculum, People, Work, News&Event
- **CMS 관리**: 콘텐츠 CRUD, 네비게이션, 푸터, 헤더 관리
- **인증**: JWT 기반 관리자 인증 (bcrypt + jose)
- **에디터**: Tiptap WYSIWYG 리치 텍스트 에디터
- **애니메이션**: GSAP ScrollTrigger 기반 스크롤/호버 효과
- **다국어**: 한국어/영어 이중 언어 (DB 필드 기반)
- **파일 관리**: Vercel Blob 스토리지 + Sharp 이미지 최적화

---

## 2. 아키텍처 평가

### 2.1 디렉토리 구조 ⭐⭐⭐⭐ (4/5)

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/           # 공개 페이지 (Route Group)
│   ├── admin/              # 관리자 페이지
│   └── api/                # API 엔드포인트 (56개)
├── components/             # React 컴포넌트 (92개)
│   ├── admin/              # 관리자 UI (47)
│   ├── public/             # 공개 페이지 UI (41)
│   └── common/             # 공통 (4)
├── hooks/                  # 커스텀 훅 (21)
├── lib/                    # 유틸리티 (25)
├── types/                  # 타입 정의
├── contexts/               # React Context (1개)
├── i18n/                   # 국제화 설정
└── constants/              # 상수 (typography)
```

**장점**:
- admin/public 명확한 분리
- Route Group `(public)` 활용으로 깔끔한 라우팅
- 기능별 hooks 분리 (curriculum/, home/)

**개선점**:
- `common/` 컴포넌트가 4개로 너무 적음 → 재사용 가능한 UI 요소 분리 필요
- `lib/media-url.ts`가 2,028줄로 과도하게 큼

---

### 2.2 데이터 흐름 ⭐⭐⭐⭐ (4/5)

```
┌─────────────────────────────────────────┐
│  Public Pages (SSR)                      │
│  Server Component → Prisma → PostgreSQL  │
│  ISR 60초 재검증                         │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│  Admin Pages (CSR)                       │
│  Server Auth → Client Hook → API Route   │
│  useAboutEditor / useWorkEditor 등       │
│       ↓                                  │
│  useDirtyState (스냅샷 기반 변경 감지)   │
│       ↓                                  │
│  fetch() → API Route → Prisma → DB      │
└─────────────────────────────────────────┘
```

**장점**:
- 공개 페이지: Server Component로 직접 DB 접근 (보안 + 성능)
- 관리자: useDirtyState 기반 스냅샷 diff → 변경분만 저장
- Zod 검증으로 API 입력값 런타임 타입 안전

**개선점**:
- React Query/SWR 미사용 → 클라이언트 캐싱 없음
- native fetch() 직접 사용 → API 추상화 레이어 부재

---

### 2.3 상태 관리 ⭐⭐⭐⭐ (4/5)

| 패턴 | 사용처 | 평가 |
|------|--------|------|
| **React Context** | AuthContext (1개) | 최소한으로 적절 |
| **커스텀 훅** | useAboutEditor, useWorkEditor 등 21개 | 도메인별 잘 분리됨 |
| **useDirtyState** | 변경 감지 + 되돌리기 | 깔끔한 패턴 |
| **react-hook-form** | 폼 상태 관리 | 적절한 라이브러리 선택 |

**외부 상태 라이브러리 없음** (Redux, Zustand, Recoil 미사용) → 프로젝트 규모 대비 적절한 판단

---

## 3. 코드 품질 평가

### 3.1 타입 안전성 ⭐⭐⭐⭐ (4/5)

| 지표 | 수치 | 평가 |
|------|------|------|
| TypeScript strict mode | ✅ 활성화 | 양호 |
| `: any` 사용 | 6개 파일, 109회 | ⚠️ 개선 필요 |
| Zod 스키마 | 578줄 (3개 파일) | 양호 |
| Prisma 타입 추론 | 자동 생성 | 우수 |

**장점**:
- Zod로 API 요청/응답 런타임 검증
- Prisma ORM으로 DB 쿼리 타입 안전
- 도메인 타입 정의 (`section-content.ts`, `schemas/`)

**개선점**:
- `any` 타입 109회 사용 → 구체적 타입으로 교체 필요
- JSON 컬럼 (`Section.content`) 타입이 `JsonValue` → 런타임에서만 검증

---

### 3.2 코드 위생 ⭐⭐⭐ (3/5)

| 지표 | 수치 | 평가 |
|------|------|------|
| `console.log/warn/error` | 32개 파일, 61회 | ⚠️ 정리 필요 |
| 최대 컴포넌트 크기 | VideoHero.tsx 553줄 | ⚠️ 분리 권장 |
| 최대 유틸리티 크기 | media-url.ts 2,028줄 | 🔴 과도함 |

**대형 컴포넌트 TOP 10**:

| 순위 | 파일 | 라인 | 모듈 |
|------|------|------|------|
| 1 | VideoHero.tsx | 553 | public/home |
| 2 | NewsBlockRenderer.tsx | 486 | public/news |
| 3 | TiptapContentRenderer.tsx | 462 | public/news |
| 4 | NewsEventDetailContent.tsx | 449 | public/news |
| 5 | CourseTable.tsx | 415 | admin/curriculum |
| 6 | NewsArticleModal.tsx | 396 | admin/news |
| 7 | GalleryLayoutEditor.tsx | 386 | admin/shared |
| 8 | WorkProjectModal.tsx | 378 | admin/work |
| 9 | WorkArchive.tsx | 369 | public/work |
| 10 | CurriculumSectionEditor.tsx | 359 | admin/curriculum |

---

### 3.3 테스트 커버리지 ⭐⭐ (2/5)

| 테스트 유형 | 상태 | 파일 수 |
|------------|------|---------|
| **E2E (Playwright)** | ✅ 존재 | 5개 (535줄) |
| **Unit Test** | ❌ 없음 | 0 |
| **Integration Test** | ❌ 없음 | 0 |
| **Component Test** | ❌ 없음 | 0 |

**E2E 테스트 범위**:
- `admin-login.critical.spec.ts` — 로그인 플로우
- `public-pages.critical.spec.ts` — 공개 페이지 렌더링
- `admin-news-editor.spec.ts` — 뉴스 에디터
- `admin-work-editor.spec.ts` — 작업 에디터
- `responsive.spec.ts` — 반응형 디자인

**개선 필요**: 커스텀 훅, 유틸리티 함수, API 라우트에 대한 단위 테스트 필요

---

## 4. 보안 평가

### 4.1 심각도별 이슈 분류

#### 🔴 Critical (5건 — 즉시 수정 필요)

| # | 이슈 | 파일 | 설명 |
|---|------|------|------|
| C1 | **인증 없는 API 엔드포인트** | `api/admin/studio-knot-cms-setup/route.ts` | checkAdminAuth() 없이 DB 직접 수정 가능 |
| C2 | **하드코딩된 인증 토큰** | `api/admin/work/normalize-descriptions/route.ts:16` | `'normalize-work-2026'` 문자열로 인증 |
| C3 | **CSRF 보호 없음** | 모든 POST/PUT/DELETE 라우트 | Origin/Referer 검증 미구현 |
| C4 | **프로덕션 console.log** | `normalize-descriptions/route.ts:23,66,74,103` | 민감 데이터 로깅 노출 |
| C5 | **Debug 엔드포인트 노출** | `studio-knot-cms-setup/route.ts:103-123` | DEBUG 환경변수로 DB 구조 노출 가능 |

#### 🟠 High (5건 — 빠른 수정 권장)

| # | 이슈 | 파일 | 설명 |
|---|------|------|------|
| H1 | **SVG XXE 공격 취약** | `api/admin/upload/route.ts:60-61` | SVG 매직 바이트 검증 스킵 |
| H2 | **XSS 방어 불완전** | `lib/sanitize.ts:7-16` | 정규식 기반 sanitization 우회 가능 |
| H3 | **JWT Secret 이중화** | `lib/auth/auth.ts:8-10` | `JWT_SECRET \|\| NEXTAUTH_SECRET` 불명확 |
| H4 | **Race Condition** | `api/admin/about/people/route.ts:114-148` | order 계산과 생성 사이 트랜잭션 없음 |
| H5 | **에러 메시지 정보 유출** | `api/admin/news/articles/route.ts:99-102` | Zod 검증 에러 스키마 노출 |

#### 🟡 Medium (7건)

| # | 이슈 | 설명 |
|---|------|------|
| M1 | Rate Limiting 미적용 | 로그인 외 Admin API에 rate limit 없음 |
| M2 | 트랜잭션 누락 | 순서 재정렬 시 원자성 미보장 |
| M3 | 캐시 무효화 불완전 | revalidatePath 누락 → 구 데이터 노출 |
| M4 | JSON 깊이 제한 없음 | 재귀 구조 depth 제한 없음 |
| M5 | TiptapRenderer MAX_DEPTH=50 | 과도하게 관대 (10이면 충분) |
| M6 | 빈 객체 vs Null 구분 | Prisma.JsonNull vs `{}` 혼동 |
| M7 | crypto.randomBytes 엔트로피 | 8 bytes → 12 bytes 권장 |

#### 🟢 Low (7건)

| # | 이슈 | 설명 |
|---|------|------|
| L1 | Error Boundary 없음 | React 에러 경계 미구현 |
| L2 | 접근성(A11y) 부족 | aria-label, role 속성 희소 |
| L3 | 로깅 비일관성 | console.error vs logger 혼용 |
| L4 | plain `<img>` 사용 | next/image 미사용 (일부 컴포넌트) |
| L5 | Zod 메시지 하드코딩 | i18n 미적용 |
| L6 | 파일 해시 미저장 | 업로드 후 무결성 검증 불가 |
| L7 | 미사용 의존성 | React Query 설치 → 미사용 |

---

### 4.2 인증/인가 구조

```
┌─────────────────────────────────────────┐
│  Middleware (Edge Runtime)               │
│  /admin/* → JWT Cookie 검증             │
│  /api/admin/* → JWT Cookie 검증         │
│  비인증 → /admin/login 리다이렉트       │
├─────────────────────────────────────────┤
│  API Route Handler                       │
│  checkAdminAuth() / checkAdminAuthFast()│
│  → JWT 토큰 해독 → 사용자 정보 반환    │
├─────────────────────────────────────────┤
│  JWT 구현                               │
│  알고리즘: HS256 (jose 라이브러리)      │
│  유효기간: 24시간                       │
│  저장: httpOnly Cookie                  │
│  비밀키: JWT_SECRET 환경변수            │
├─────────────────────────────────────────┤
│  비밀번호                               │
│  해싱: bcrypt (기본 salt rounds)        │
│  Rate Limit: 이메일당 5회 (로그인만)    │
└─────────────────────────────────────────┘
```

**평가**: 기본 구조는 양호하나, CSRF 보호와 Admin API 전체 rate limiting 필요

---

## 5. 성능 평가

### 5.1 렌더링 전략 ⭐⭐⭐⭐ (4/5)

| 페이지 유형 | 전략 | 평가 |
|------------|------|------|
| 공개 페이지 | Server Component (SSR) | ✅ 우수 |
| ISR 캐싱 | 60초 재검증 | ✅ 적절 |
| 관리자 페이지 | 서버 인증 + 클라이언트 렌더링 | ✅ 적절 |
| 이미지 최적화 | next/image + Sharp | ✅ 양호 |

### 5.2 번들 최적화 ⭐⭐⭐ (3/5)

**잠재적 번들 크기 이슈**:
- GSAP (3.14.2) — ~90KB gzipped
- Tiptap 에디터 + 확장 — ~200KB+
- @hello-pangea/dnd + @dnd-kit — DnD 라이브러리 2개 중복
- lucide-react — 아이콘 트리셰이킹 확인 필요

**개선점**:
- DnD 라이브러리 통일 (`@dnd-kit` 또는 `@hello-pangea/dnd` 하나만)
- 관리자 전용 라이브러리 dynamic import 확인
- `media-url.ts` (2,028줄) 분할 필요

### 5.3 데이터 페칭 ⭐⭐⭐ (3/5)

**이슈**:
- 클라이언트 캐싱 레이어 없음 (SWR/React Query 미사용)
- 관리자 페이지에서 매번 전체 데이터 re-fetch
- N+1 쿼리 가능성 (Prisma include로 대부분 해결)

---

## 6. 스타일링 평가

### 6.1 CSS 접근법 ⭐⭐⭐⭐ (4/5)

| 항목 | 상태 |
|------|------|
| **프레임워크** | Tailwind CSS v4 |
| **커스텀 폰트** | SUIT (Variable) + Satoshi (Variable) |
| **타이포그래피** | `constants/typography.ts` (130줄) 체계화 |
| **반응형** | sm / lg 브레이크포인트 |
| **CSS-in-JS** | 없음 (Tailwind 전용) |
| **CSS 모듈** | 없음 |

**커스텀 CSS**: TiptapEditor 전용 (452줄 + 152줄)

---

## 7. 다국어(i18n) 평가 ⭐⭐⭐ (3/5)

| 항목 | 상태 |
|------|------|
| **라이브러리** | next-intl v4.8.3 ✅ |
| **지원 로케일** | ko, en |
| **번역 파일** | ❌ 없음 (DB 필드 기반) |
| **DB 구조** | `name` + `nameEn` 패턴 |
| **런타임 전환** | ⚠️ 제한적 |

**현재 패턴**:
```typescript
// DB 레벨 이중 언어
{
  name: "홍길동",
  nameEn: "Gil-dong Hong",
  biography: { ... },
  biographyEn: { ... }
}
```

**개선점**: 번역 키 파일 시스템 도입 → UI 텍스트도 i18n 적용

---

## 8. 종합 평가

### 8.1 영역별 점수

| 영역 | 점수 | 등급 |
|------|------|------|
| **아키텍처** | 4.0/5 | ⭐⭐⭐⭐ |
| **타입 안전성** | 4.0/5 | ⭐⭐⭐⭐ |
| **보안** | 2.5/5 | ⭐⭐⭐ |
| **코드 위생** | 3.0/5 | ⭐⭐⭐ |
| **테스트** | 2.0/5 | ⭐⭐ |
| **성능** | 3.5/5 | ⭐⭐⭐⭐ |
| **스타일링** | 4.0/5 | ⭐⭐⭐⭐ |
| **다국어** | 3.0/5 | ⭐⭐⭐ |
| **DX (개발 경험)** | 3.5/5 | ⭐⭐⭐⭐ |
| **문서화** | 4.0/5 | ⭐⭐⭐⭐ |
| **종합** | **3.35/5** | **⭐⭐⭐** |

### 8.2 강점

1. **모던 스택**: Next.js 15 App Router + React 19 Server Components 활용
2. **타입 안전**: TypeScript strict + Zod 런타임 검증 + Prisma 타입 추론
3. **깔끔한 구조**: admin/public 분리, 도메인별 훅 구성
4. **상태 관리**: 외부 라이브러리 없이 커스텀 훅으로 효율적 관리
5. **유연한 콘텐츠**: JSON 컬럼 기반 섹션 시스템
6. **애니메이션**: GSAP 통합으로 풍부한 인터랙션
7. **리치 에디터**: Tiptap v3 WYSIWYG 통합
8. **CI/CD**: GitHub Actions 자동 배포 + Blue-Green

### 8.3 약점

1. **보안 취약점**: 인증 우회 API, CSRF 미보호, XSS 불완전
2. **테스트 부족**: E2E만 5개, 단위/통합 테스트 0개
3. **대형 파일**: media-url.ts (2,028줄), VideoHero.tsx (553줄) 등
4. **console.log**: 32개 파일에 61회 프로덕션 로그
5. **`any` 타입**: 6개 파일에 109회 사용
6. **DnD 중복**: @dnd-kit + @hello-pangea/dnd 2개 라이브러리 병존
7. **클라이언트 캐싱**: React Query 설치했으나 미사용

---

## 9. 우선순위별 개선 로드맵

### Phase 1: 보안 (즉시)

| 작업 | 난이도 | 영향도 |
|------|--------|--------|
| C1: studio-knot-cms-setup에 checkAdminAuth 추가 | 낮 | 높 |
| C2: normalize-descriptions 하드코딩 토큰 → 환경변수 | 낮 | 높 |
| H1: SVG 업로드 XXE 검증 추가 | 중 | 높 |
| H2: sanitize.ts → DOMPurify 교체 | 중 | 높 |
| H3: JWT_SECRET 명시적 검증 | 낮 | 중 |

### Phase 2: 코드 품질 (1~2주)

| 작업 | 난이도 | 영향도 |
|------|--------|--------|
| console.log 정리 (61회 → logger 전환) | 낮 | 중 |
| `any` 타입 제거 (109회 → 구체적 타입) | 중 | 중 |
| media-url.ts 분할 (2,028줄) | 중 | 중 |
| DnD 라이브러리 통일 | 중 | 낮 |
| React Query 제거 또는 활용 | 낮 | 낮 |

### Phase 3: 테스트 (2~4주)

| 작업 | 난이도 | 영향도 |
|------|--------|--------|
| 커스텀 훅 단위 테스트 (Vitest) | 중 | 높 |
| API 라우트 통합 테스트 | 중 | 높 |
| Zod 스키마 단위 테스트 | 낮 | 중 |
| 유틸리티 함수 테스트 | 낮 | 중 |

### Phase 4: 성능 최적화 (4~6주)

| 작업 | 난이도 | 영향도 |
|------|--------|--------|
| 관리자 API 캐싱 (SWR/React Query 도입) | 중 | 중 |
| 번들 분석 + 코드 스플리팅 | 중 | 중 |
| Error Boundary 추가 | 낮 | 중 |
| 접근성(A11y) 개선 | 중 | 낮 |

---

## 10. 파일별 수정 체크리스트

### 즉시 수정 (Critical/High)

- [ ] `src/app/api/admin/studio-knot-cms-setup/route.ts` → checkAdminAuth() 추가
- [ ] `src/app/api/admin/work/normalize-descriptions/route.ts` → 환경변수 토큰 + console 제거
- [ ] `src/lib/sanitize.ts` → DOMPurify 도입 또는 정규식 보강
- [ ] `src/app/api/admin/upload/route.ts` → SVG XXE 검증
- [ ] `src/lib/auth/auth.ts` → JWT_SECRET 필수 검증
- [ ] `src/app/api/admin/about/people/route.ts` → 트랜잭션 추가
- [ ] `src/components/public/news/TiptapContentRenderer.tsx` → MAX_DEPTH 50→10

### 코드 품질 개선

- [ ] `src/lib/media-url.ts` (2,028줄) → 모듈 분할
- [ ] `src/components/public/home/VideoHero.tsx` (553줄) → 서브 컴포넌트 분리
- [ ] `any` 타입 109회 → 구체적 타입 교체
- [ ] `console.log/warn/error` 61회 → logger 통합
- [ ] `@hello-pangea/dnd` 또는 `@dnd-kit` 하나로 통일

---

> **결론**: 모던 기술 스택을 잘 활용한 프로덕션 수준의 CMS이나, 보안 취약점 5건(Critical)의 즉시 수정과 테스트 커버리지 확대가 시급합니다. 아키텍처와 상태 관리는 프로젝트 규모에 적합하게 잘 설계되어 있습니다.
