import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Card,
  Flex,
  Heading,
  useMatchBreakpoints,
  ProfileAvatar,
  ArrowBackIcon,
  Text,
  ArrowForwardIcon,
} from 'maki-toolkit'
import { BnbUsdtPairTokenIcon } from 'components/Svg'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { useGetCollections } from 'state/nftMarket/hooks'
import { useTranslation } from 'contexts/Localization'
import Page from 'components/Layout/Page'
import PageHeader from 'components/PageHeader'

export const ITEMS_PER_PAGE = 10

const SORT_FIELD = {
  volumeBNB: 'totalVolumeBNB',
  items: 'numberTokensListed',
  supply: 'totalSupply',
}

const StyledCard = styled(Card)`
  padding: 20px 32px;
`

const StyledTable = styled.table`
  width: 100%;
  & th, & td {
    padding: 8px 0;
    vertical-align: middle;
  }
`

export const PageButtons = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.2em;
  margin-bottom: 1.2em;
`

export const Arrow = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  padding: 0 20px;
  :hover {
    cursor: pointer;
  }
`

const Collectible = () => {
  const { t } = useTranslation()
  const collections = useGetCollections()
  const { isMobile } = useMatchBreakpoints()
  const [sortField, setSortField] = useState(null)
  const [sortDirection, setSortDirection] = useState<boolean>(false)
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)

  useEffect(() => {
    let extraPages = 1
    const collectionValues = collections ? Object.values(collections) : []
    if (collectionValues.length % ITEMS_PER_PAGE === 0) {
      extraPages = 0
    }
    setMaxPage(Math.floor(collectionValues.length / ITEMS_PER_PAGE) + extraPages)
  }, [collections])

  const sortedCollections = useMemo(() => {
    const collectionValues = collections ? Object.values(collections) : []

    return collectionValues
      .sort((a, b) => {
        if (sortField && a && b) {
          return parseFloat(a[sortField]) > parseFloat(b[sortField])
            ? (sortDirection ? -1 : 1) * 1
            : (sortDirection ? -1 : 1) * -1
        }
        return -1
      })
      .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE)
  }, [page, collections, sortDirection, sortField])

  const handleSort = useCallback(
    (newField: string) => {
      setSortField(newField)
      setSortDirection(sortField !== newField ? true : !sortDirection)
    },
    [sortDirection, sortField],
  )

  const arrow = useCallback(
    (field: string) => {
      const directionArrow = !sortDirection ? '↑' : '↓'
      return sortField === field ? directionArrow : ''
    },
    [sortDirection, sortField],
  )

  return (
    <>
      <PageHeader>
        <Heading as="h1" scale="xxl" color="secondary">
          {t('Collections')}
        </Heading>
      </PageHeader>
      <Page>
        <StyledCard>
          <StyledTable>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>{t('Collection')}</th>
                <th style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort(SORT_FIELD.volumeBNB)}>
                  {t('Volume')}
                  {arrow(SORT_FIELD.volumeBNB)}
                </th>
                {!isMobile && (
                  <>
                    <th style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort(SORT_FIELD.items)}>
                      {t('Items')}
                      {arrow(SORT_FIELD.items)}
                    </th>
                    <th style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort(SORT_FIELD.supply)}>
                      {t('Supply')}
                      {arrow(SORT_FIELD.supply)}
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {sortedCollections.map((collection: any) => {
                const volume = collection.totalVolumeBNB
                  ? parseFloat(collection.totalVolumeBNB).toLocaleString(undefined, {
                      minimumFractionDigits: 3,
                      maximumFractionDigits: 3,
                    })
                  : '0'
                return (
                  <tr key={collection.address}>
                    <td>
                      <Link to={`/collections/${collection.address}`}>
                        <Flex alignItems="center">
                          <ProfileAvatar src={collection.avatar} width={48} height={48} mr="16px" />
                          {collection.name}
                        </Flex>
                      </Link>
                    </td>
                    <td>
                      <Flex alignItems="center">
                        {volume}
                        <BnbUsdtPairTokenIcon ml="8px" />
                      </Flex>
                    </td>
                    {!isMobile && (
                      <>
                        <td>{collection.numberTokensListed}</td>
                        <td>{collection.totalSupply}</td>
                      </>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </StyledTable>
          <PageButtons>
            <Arrow
              onClick={() => {
                setPage(page === 1 ? page : page - 1)
              }}
            >
              <ArrowBackIcon color={page === 1 ? 'textDisabled' : 'primary'} />
            </Arrow>

            <Text>{t('Page %page% of %maxPage%', { page, maxPage })}</Text>

            <Arrow
              onClick={() => {
                setPage(page === maxPage ? page : page + 1)
              }}
            >
              <ArrowForwardIcon color={page === maxPage ? 'textDisabled' : 'primary'} />
            </Arrow>
          </PageButtons>
        </StyledCard>
      </Page>
    </>
  )
}

export default Collectible
