/* eslint-disable no-unused-vars */
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

const StatCard = ({ title, value, icon: Icon, trend, description }) => (
  <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </CardContent>
  </Card>
)

export default StatCard